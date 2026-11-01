document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var form = document.getElementById('frmPacientes');

    if (!form) {
        return;
    }

    var oper = form.dataset.oper;
    var servidor = form.dataset.servidor;
    var btnInserir = document.getElementById('btnInserirPaciente');
    var btnAtualizar = document.getElementById('btnAtualizarPaciente');

    if (oper === 'Cr') {
        dw3OcultarBotao('btnAtualizarPaciente'); 
        dw3OcultarBotao('btnRemoverPaciente');
    }

    if (oper === 'Re') { 
        dw3OcultarBotao('btnInserirPaciente');
        dw3OcultarBotao('btnAtualizarPaciente');
        dw3OcultarBotao('btnRemoverPaciente');
        vwGetPacienteByID();
    }

    if (oper === 'Up') {
        dw3OcultarBotao('btnInserirPaciente');
        dw3OcultarBotao('btnRemoverPaciente');
        vwGetPacienteByID();
        btnAtualizar.disabled = !(vwGetPacienteByID());
        btnAtualizar.addEventListener('click', function() {
            vwUpdatePaciente();
        });
    }

    if (oper === 'De') {
        dw3OcultarBotao('btnInserirPaciente');
        dw3OcultarBotao('btnAtualizarPaciente');
        var btnRemover = document.getElementById('btnRemoverPaciente'); 
        vwGetPacienteByID();
        btnRemover.disabled = !(vwGetPacienteByID());
        btnRemover.addEventListener('click', function() {
            vwDeletePaciente();
        });
    }


    if (btnInserir) {
        btnInserir.addEventListener('click', function() {
            vwInsertPaciente();
        });
    }
});

async function vwGetPacienteByID() {
  var form = document.getElementById('frmPacientes');

  try {
    var parametros = new URLSearchParams(window.location.search);
    var pacienteId = parametros.get('pacienteId');
    var servidor = form.dataset.servidor;

    if (!pacienteId || !/^\d+$/.test(pacienteId) || Number(pacienteId) <= 0) {
      throw new Error('ID do paciente invalido.');
    }

    if (!servidor) {
      throw new Error('Endereco do servidor backend nao configurado.');
    }

    var response = await fetch(servidor + '/getPacienteByID/' + encodeURIComponent(pacienteId), {
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      })
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel carregar o paciente.');
    }

    var data = await response.json();

    if (data.auth === false) {
      throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta invalida do servidor backend.');
    }

    var paciente = data.registro[0];

    if (!paciente) {
      throw new Error('Paciente nao encontrado.');
    }

    document.getElementById('pacienteid').value = paciente.pacienteid;
    document.getElementById('cpf').value = paciente.cpf ?? '';
    document.getElementById('nome').value = paciente.nome ?? '';
    document.getElementById('email').value = paciente.email ?? '';
    document.getElementById('deleted').value = String(paciente.deleted === true);

    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar paciente.');
    return false;
  }
}

async function vwInsertPaciente() {
    var form = document.getElementById('frmPacientes');
    var btnInserir = document.getElementById('btnInserirPaciente');

    try {
        if (!form.reportValidity()) {
            return;
        }

        var servidor = form.dataset.servidor;
        if (!servidor) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }

        if (btnInserir) {
            btnInserir.disabled = true;
        }

        var response = await fetch(servidor + '/insertPaciente', {
            method: 'POST',
            headers: dw3MontarHeadersAutenticacao({'content-type': 'application/json'}),
            body: JSON.stringify(montarPacienteDoFormulario())
        });

        if (!response.ok) {
            throw new Error('Nao foi possivel inserir o paciente.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel inserir o paciente.');
        }

        window.location.href = '/pacientes';
    } catch (error) {
        alert(error.message || 'Erro ao inserir paciente.');
    } finally {
        if (btnInserir) {
            btnInserir.disabled = false;
        }
    }
}

async function vwUpdatePaciente() {
    var form = document.getElementById('frmPacientes');
    var btnAtualizar = document.getElementById('btnAtualizarPaciente');
    
    if (btnAtualizar.disabled || !form.reportValidity()) {
        return;
    }

    try {
        var pacienteId = new URLSearchParams(window.location.search).get('pacienteId');
        var servidor = form.dataset.servidor;

        if (!pacienteId || !/^\d+$/.test(pacienteId) || Number(pacienteId) <= 0) {
            throw new Error('ID do paciente inválido.');
        }

        if (!servidor) {
            throw new Error('Endereço do servidor backend nao configurado.');
        }

        btnAtualizar.disabled = true;

        var paciente = montarPacienteDoFormulario();

        var response = await fetch(servidor + '/updatePaciente/' + encodeURIComponent(pacienteId), {
            method: 'PUT',
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            }),
            body: JSON.stringify(paciente)
        });

        if (!response.ok) {
            throw new Error('Nao foi possivel atualizar o paciente.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel atualizar o paciente.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhum paciente foi atualizado.');
        }
        alert('Paciente atualizado com sucesso.');
    } catch (error) {
        alert(error.message || 'Erro ao atualizar paciente.');
    } finally {
        btnAtualizar.disabled = false;
    }
}

async function vwDeletePaciente() {
    var form = document.getElementById('frmPacientes');
    var btnRemover = document.getElementById('btnRemoverPaciente');

    if (btnRemover.disabled) {
        return;
    }
    if (!window.confirm('Confirma a remoção deste paciente?')) {
        return;
    }

    try {
        var pacienteId = document.getElementById('pacienteid').value;
        var servidor = form.dataset.servidor;

        if (!pacienteId || !/^\d+$/.test(pacienteId) || Number(pacienteId) <= 0) {
            throw new Error('ID do paciente invalido.');
        }
        if (!servidor) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }

        btnRemover.disabled = true;

        var response = await fetch(servidor + '/deletePaciente/' + encodeURIComponent(pacienteId), {
            method: 'DELETE',
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Nao foi possivel remover o paciente.');
        }

        var data = await response.json();

        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel remover o paciente.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhum paciente foi removido.');
        }

        window.location.href = '/pacientes';
    } catch (error) {
        alert(error.message || 'Erro ao remover paciente.');
    } finally {
        btnRemover.disabled = false;
    }
}

function montarPacienteDoFormulario() {
    return {
        cpf: document.getElementById('cpf').value,
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        deleted: document.getElementById('deleted').value === 'true'
    };
}