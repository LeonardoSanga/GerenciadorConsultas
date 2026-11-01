const db = require("../../../database/databaseconfig");

const GetAllConsultas = async () => {
    return (
        await db.query(
            "SELECT *,(SELECT nome from paciente where pacienteid = consulta.pacienteid)" +
            "FROM consulta WHERE deleted = false ORDER BY dataconsulta ASC"
        )
    ).rows;
};

const GetConsultaByID = async (consultaIDPar) => {
    return (
        await db.query(
            "SELECT *,(SELECT nome from paciente where pacienteid = consulta.pacienteid)" +
            "FROM consulta WHERE consultaid = $1 and deleted = false ORDER BY dataconsulta ASC",
            [consultaIDPar]
        )
    ).rows;
};

const InsertConsulta = async (consultaREGPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "INSERT INTO consulta " + "values(default, $1, $2, $3, $4, $5, $6, $7)",
                [
                    consultaREGPar.descricao,
                    consultaREGPar.valor,
                    consultaREGPar.dataconsulta,
                    consultaREGPar.datarealizacao || null,
                    consultaREGPar.status,
                    consultaREGPar.pacienteid,
                    consultaREGPar.deleted,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlConsultas|insertConsulta] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const UpdateConsulta = async (consultaIDPar, consultaREGPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE consulta SET " +
                "descricao = $2, " +
                "valor = $3, " +
                "dataconsulta = $4, " +
                "datarealizacao = $5, " +
                "status = $6, " +
                "pacienteid = $7, " +
                "deleted = $8 " +
                "WHERE consultaid = $1",
                [
                    consultaIDPar,
                    consultaREGPar.descricao,
                    consultaREGPar.valor,
                    consultaREGPar.dataconsulta,
                    consultaREGPar.datarealizacao || null,
                    consultaREGPar.status,
                    consultaREGPar.pacienteid,
                    consultaREGPar.deleted,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlConsultas|updateConsulta] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const DeleteConsulta = async (consultaIDPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE consulta SET " + "deleted = true " + "WHERE consultaid = $1",
                [consultaIDPar]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlConsultas|deleteConsulta] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const GetPacientesToConsultas = async () => {
    return (await db.query("select pacienteid, nome from paciente where not deleted = true")).rows;
};


module.exports = {
    GetAllConsultas,
    GetConsultaByID,
    InsertConsulta,
    UpdateConsulta,
    DeleteConsulta,
    GetPacientesToConsultas,
};
