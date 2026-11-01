const db = require("../../../database/databaseconfig");

const GetAllPacientes = async () => {
    return (
        await db.query(
            "SELECT * " +
            "FROM paciente WHERE deleted = false ORDER BY nome ASC"
        )
    ).rows;
};

const GetPacienteByID = async (pacienteIDPar) => {
    return (
        await db.query(
            "SELECT * " +
            "FROM paciente WHERE pacienteid = $1 and deleted = false ORDER BY nome ASC",
            [pacienteIDPar]
        )
    ).rows;
};

const InsertPaciente = async (pacienteREGPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "INSERT INTO paciente " + "values(default, $1, $2, $3, $4)",
                [
                    pacienteREGPar.cpf,
                    pacienteREGPar.nome,
                    pacienteREGPar.email,
                    pacienteREGPar.deleted,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlPacientes|InsertPaciente] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const UpdatePaciente = async (pacienteIDPar, pacienteREGPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE paciente SET " +
                "cpf = $2, " +
                "nome = $3, " +
                "email = $4, " +
                "deleted = $5 " +
                "WHERE pacienteid = $1",
                [
                    pacienteIDPar,
                    pacienteREGPar.cpf,
                    pacienteREGPar.nome,
                    pacienteREGPar.email,
                    pacienteREGPar.deleted,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlPacientes|UpdatePaciente] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const DeletePaciente = async (pacienteIDPar) => {
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE paciente SET " + "deleted = true " + "WHERE pacienteid = $1",
                [pacienteIDPar]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlPacientes|DeletePaciente] " + error.detail;
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

module.exports = {
    GetAllPacientes,
    GetPacienteByID,
    InsertPaciente,
    UpdatePaciente,
    DeletePaciente,
};
