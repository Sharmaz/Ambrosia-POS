package pos.ambrosia.utest

import org.junit.After
import org.junit.Before
import pos.ambrosia.models.PayoutAccountUpsert
import pos.ambrosia.services.ActiveLightningBackend
import pos.ambrosia.services.PayoutAccountService
import pos.ambrosia.utils.ExposedTestDb
import pos.ambrosia.utils.FakeLightningBackend
import java.io.File
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class PayoutAccountServiceTest {
    private lateinit var databaseFile: File
    private val service = PayoutAccountService()

    private val validBankRequest =
        PayoutAccountUpsert(
            type = "bank",
            accountHolder = "Jane Doe",
            bankName = "Acme Bank",
            accountNumber = "1234567890",
            currencyId = null,
        )

    @Before
    fun setUp() {
        databaseFile = ExposedTestDb.connect()
        ActiveLightningBackend.closeActive()
    }

    @After
    fun tearDown() {
        ActiveLightningBackend.closeActive()
        ExposedTestDb.cleanup(databaseFile)
    }

    @Test
    fun `addPayoutAccount returns id for valid bank request`() {
        val currencyId = ExposedTestDb.seedCurrency("USD")

        val payoutAccountId = service.addPayoutAccount(validBankRequest.copy(currencyId = currencyId))

        assertNotNull(payoutAccountId)
        val payoutAccount = service.getPayoutAccountById(payoutAccountId)
        assertNotNull(payoutAccount)
        assertEquals("bank", payoutAccount.type)
        assertEquals("Jane Doe", payoutAccount.accountHolder)
        assertEquals(currencyId, payoutAccount.currencyId)
    }

    @Test
    fun `addPayoutAccount rejects bank request missing required fields`() {
        val currencyId = ExposedTestDb.seedCurrency("USD")
        val validRequest = validBankRequest.copy(currencyId = currencyId)

        assertNull(service.addPayoutAccount(validRequest.copy(accountHolder = "  ")))
        assertNull(service.addPayoutAccount(validRequest.copy(bankName = "  ")))
        assertNull(service.addPayoutAccount(validRequest.copy(currencyId = null)))
        assertNull(service.addPayoutAccount(validRequest.copy(currencyId = UUID.randomUUID().toString())))
        assertNull(
            service.addPayoutAccount(
                validRequest.copy(accountNumber = null, iban = null, clabe = null),
            ),
        )
        assertNull(service.addPayoutAccount(validRequest.copy(lightningAddress = "user@getalby.com")))
    }

    @Test
    fun `addPayoutAccount accepts bank request identified by iban or clabe`() {
        val currencyId = ExposedTestDb.seedCurrency("EUR")
        val ibanRequest =
            validBankRequest.copy(currencyId = currencyId, accountNumber = null, iban = "DE89370400440532013000")
        val clabeRequest =
            validBankRequest.copy(currencyId = currencyId, accountNumber = null, clabe = "032180000118359719")

        assertNotNull(service.addPayoutAccount(ibanRequest))
        assertNotNull(service.addPayoutAccount(clabeRequest))
    }

    @Test
    fun `addPayoutAccount returns id for lightning request with lightning address`() {
        val payoutAccountId =
            service.addPayoutAccount(
                PayoutAccountUpsert(type = "lightning", lightningAddress = "freelancer@getalby.com"),
            )

        assertNotNull(payoutAccountId)
        val payoutAccount = service.getPayoutAccountById(payoutAccountId)
        assertNotNull(payoutAccount)
        assertEquals("lightning", payoutAccount.type)
        assertEquals("freelancer@getalby.com", payoutAccount.lightningAddress)
    }

    @Test
    fun `addPayoutAccount rejects blank lightning address without a local node fallback`() {
        val payoutAccountId =
            service.addPayoutAccount(PayoutAccountUpsert(type = "lightning", lightningAddress = null))

        assertNull(payoutAccountId)
    }

    @Test
    fun `addPayoutAccount accepts blank lightning address when a local node is available`() {
        ActiveLightningBackend.set(FakeLightningBackend("phoenixd"))

        val payoutAccountId =
            service.addPayoutAccount(PayoutAccountUpsert(type = "lightning", lightningAddress = null))

        assertNotNull(payoutAccountId)
    }

    @Test
    fun `addPayoutAccount rejects lightning request mixing bank fields`() {
        val payoutAccountId =
            service.addPayoutAccount(
                PayoutAccountUpsert(
                    type = "lightning",
                    lightningAddress = "freelancer@getalby.com",
                    bankName = "Acme Bank",
                ),
            )

        assertNull(payoutAccountId)
    }

    @Test
    fun `addPayoutAccount rejects unknown type`() {
        assertNull(service.addPayoutAccount(validBankRequest.copy(type = "cash")))
    }

    @Test
    fun `getPayoutAccounts excludes deleted accounts`() {
        ExposedTestDb.seedPayoutAccount()
        ExposedTestDb.seedPayoutAccount(isDeleted = true)

        val payoutAccounts = service.getPayoutAccounts()

        assertEquals(1, payoutAccounts.size)
        assertFalse(payoutAccounts[0].isDeleted)
    }

    @Test
    fun `getPayoutAccountById returns null for invalid missing or deleted account`() {
        val deletedPayoutAccountId = ExposedTestDb.seedPayoutAccount(isDeleted = true)

        assertNull(service.getPayoutAccountById("not-a-uuid"))
        assertNull(service.getPayoutAccountById(UUID.randomUUID().toString()))
        assertNull(service.getPayoutAccountById(deletedPayoutAccountId))
    }

    @Test
    fun `updatePayoutAccount updates active account`() {
        val currencyId = ExposedTestDb.seedCurrency("USD")
        val payoutAccountId = ExposedTestDb.seedPayoutAccount(currencyId = currencyId)

        val payoutAccountWasUpdated =
            service.updatePayoutAccount(
                payoutAccountId,
                validBankRequest.copy(currencyId = currencyId, accountHolder = "Updated Holder"),
            )

        assertTrue(payoutAccountWasUpdated)
        val payoutAccount = service.getPayoutAccountById(payoutAccountId)
        assertNotNull(payoutAccount)
        assertEquals("Updated Holder", payoutAccount.accountHolder)
    }

    @Test
    fun `updatePayoutAccount returns false for invalid missing or deleted account`() {
        val currencyId = ExposedTestDb.seedCurrency("USD")
        val deletedPayoutAccountId = ExposedTestDb.seedPayoutAccount(currencyId = currencyId, isDeleted = true)
        val validRequest = validBankRequest.copy(currencyId = currencyId)

        assertFalse(service.updatePayoutAccount("not-a-uuid", validRequest))
        assertFalse(service.updatePayoutAccount(UUID.randomUUID().toString(), validRequest))
        assertFalse(service.updatePayoutAccount(deletedPayoutAccountId, validRequest))
        assertFalse(service.updatePayoutAccount(deletedPayoutAccountId, validRequest.copy(accountHolder = " ")))
    }

    @Test
    fun `deletePayoutAccount soft deletes account`() {
        val payoutAccountId = ExposedTestDb.seedPayoutAccount()

        val payoutAccountWasDeleted = service.deletePayoutAccount(payoutAccountId)

        assertTrue(payoutAccountWasDeleted)
        assertNull(service.getPayoutAccountById(payoutAccountId))
    }

    @Test
    fun `deletePayoutAccount returns false for invalid missing or already deleted account`() {
        val deletedPayoutAccountId = ExposedTestDb.seedPayoutAccount(isDeleted = true)

        assertFalse(service.deletePayoutAccount("not-a-uuid"))
        assertFalse(service.deletePayoutAccount(UUID.randomUUID().toString()))
        assertFalse(service.deletePayoutAccount(deletedPayoutAccountId))
    }
}
