package pos.ambrosia.api

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.sql.Connection
import pos.ambrosia.db.DatabaseConnection
import pos.ambrosia.services.PermissionsService
import pos.ambrosia.utils.authenticateAdmin

fun Application.configurePermissions() {
    val connection: Connection = DatabaseConnection.getConnection()
    val permissionsService = PermissionsService(environment, connection)
    routing {
        route("/permissions") {
            authenticateAdmin() {
                get("") {
                    val list = permissionsService.getAll()
                    if (list.isEmpty()) {
                        call.respond(HttpStatusCode.NoContent)
                    } else {
                        call.respond(HttpStatusCode.OK, list)
                    }
                }
            }
        }
    }
}

