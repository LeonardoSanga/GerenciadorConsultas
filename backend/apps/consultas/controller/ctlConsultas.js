const mdlConsultas = require("../model/mdlConsultas");

const GetAllConsultas = (req, res) => (async () => {
    let registro = await mdlConsultas.GetAllConsultas();

    for (let i = 0; i < registro.length; i++) {
        const row = registro[i]; // Current row

        if (row.dataconsulta != null) {
            const formattedDateConsulta = row.dataconsulta.toISOString().split('T')[0];
            row.dataconsulta = formattedDateConsulta;
        }
        
        if (row.datarealizacao != null) {
            const formattedDateRealizacao = row.datarealizacao.toISOString().split('T')[0];
            row.datarealizacao = formattedDateRealizacao;
        }
    }

    res.json({ status: "ok", "registro": registro });
})();

const GetConsultaByID = (req, res) => (async () => {
    const consultaID = parseInt(req.params.consultaid);
    let registro = await mdlConsultas.GetConsultaByID(consultaID);
    registro = registro[0];

    if (registro.dataconsulta != null) {
        const formattedDateConsulta = registro.dataconsulta.toISOString().split('T')[0];
        registro.dataconsulta = formattedDateConsulta;
    }
        
    if (registro.datarealizacao != null) {
        const formattedDateRealizacao = registro.datarealizacao.toISOString().split('T')[0];
        registro.datarealizacao = formattedDateRealizacao;
    }

    res.json({ status: "ok", "registro": registro });
})();

const InsertConsulta = (request, res) => (async () => {
    const consultaREG = request.body;
    let { msg, linhasAfetadas } = await mdlConsultas.InsertConsulta(consultaREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const UpdateConsulta = (request, res) => (async () => {
    const consultaID = parseInt(request.params.consultaid);
    const consultaREG = request.body;
    let { msg, linhasAfetadas } = await mdlConsultas.UpdateConsulta(consultaID, consultaREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const DeleteConsulta = (request, res) => (async () => {
    const consultaID = parseInt(request.params.consultaid);
    let { msg, linhasAfetadas } = await mdlConsultas.DeleteConsulta(consultaID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
})();

const GetPacientesToConsultas = (req, res) => (async () => {
    let registro = await mdlConsultas.GetPacientesToConsultas();
    res.json({ status: "ok", "registro": registro });
})();

module.exports = {
    GetAllConsultas,
    GetConsultaByID,
    InsertConsulta,
    UpdateConsulta,
    DeleteConsulta,
    GetPacientesToConsultas
};
