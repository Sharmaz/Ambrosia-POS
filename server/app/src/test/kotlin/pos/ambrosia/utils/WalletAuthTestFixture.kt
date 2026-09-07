package pos.ambrosia.utils

import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.header
import io.ktor.http.HttpHeaders
import io.ktor.server.config.MapApplicationConfig
import io.ktor.server.engine.applicationEnvironment
import io.ktor.server.testing.ApplicationTestBuilder
import pos.ambrosia.configureAuthentication
import pos.ambrosia.services.TokenService

private const val TEST_SECRET = "wallet-auth-test-fixture-secret"
private const val TEST_ISSUER = "wallet-auth-test-fixture-issuer"
private const val TEST_AUDIENCE = "wallet-auth-test-fixture-audience"

fun ApplicationTestBuilder.installWalletAuth(userName: String = "wallet-auth-test-user"): String {
    val testApplicationConfig =
        MapApplicationConfig(
            "secret" to TEST_SECRET,
            "jwt.issuer" to TEST_ISSUER,
            "jwt.audience" to TEST_AUDIENCE,
        )

    environment {
        config = testApplicationConfig
    }
    application {
        configureAuthentication()
    }

    val userId = ExposedTestDb.seedUser(userName)
    val tokenService = TokenService(applicationEnvironment { config = testApplicationConfig })
    return tokenService.generateWalletAccessToken(userId)
}

fun HttpRequestBuilder.withWalletAuthCookie(walletAccessToken: String) {
    header(HttpHeaders.Cookie, "walletAccessToken=$walletAccessToken")
}
