import FincaService from '../services/fincaService.js';
import EmpresaService from '../services/empresaService.js';
import Swal from 'sweetalert2'; // ✅ Importar SweetAlert2


class FincasComponent {
    constructor() {
        this.container = null;
        this.fincaEditando = null;
        this.empresas = [];
        this.eventListenersBound = false; // ✅ Control para evitar duplicados
    }

    async init(container) {
        this.container = container;
        await this.loadEmpresas();
        await this.render();
        await this.loadFincas();

        // ✅ Solo bindear eventos una vez
        if (!this.eventListenersBound) {
            this.bindEvents();
            this.eventListenersBound = true;
        }
    }

    async loadEmpresas() {
        try {
            this.empresas = await EmpresaService.getEmpresas();
        } catch (error) {
            console.error('Error cargando empresas:', error);
            this.empresas = [];
        }
    }

    async render() {
        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card agri-card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-map-marked-alt mr-2"></i>
                                    Gestión de Fincas
                                </h3>
                                <div class="card-tools">
                                    <button class="btn btn-success" id="btnNuevaFinca">
                                        <i class="fas fa-plus mr-1"></i> Nueva Finca
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="fincasTableContainer">
                                    <div class="text-center py-4">
                                        <div class="spinner-border text-success" role="status">
                                            <span class="visually-hidden">Cargando...</span>
                                        </div>
                                        <p class="mt-2">Cargando fincas...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal para crear/editar finca -->
            <div class="modal fade" id="fincaModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="fincaModalTitle">Nueva Finca</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="fincaForm">
                                <div class="mb-3">
                                    <label for="id_empresa" class="form-label">Empresa *</label>
                                    <select class="form-control" id="id_empresa" required>
                                        <option value="">Seleccionar empresa...</option>
                                        ${this.empresas.map(empresa =>
            `<option value="${empresa.id_empresa}">${empresa.nombre}</option>`
        ).join('')}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="nombre" class="form-label">Nombre de la Finca *</label>
                                    <input type="text" class="form-control" id="nombre" required>
                                </div>
                                <div class="mb-3">
                                    <label for="ubicacion" class="form-label">Ubicación</label>
                                    <textarea class="form-control" id="ubicacion" rows="3" placeholder="Dirección o coordenadas de la finca..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" id="btnGuardarFinca">
                                <i class="fas fa-save mr-1"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        console.log('🔗 Bind events - Fincas'); // Para debug

        // ✅ Remover event listeners anteriores primero
        this.removeEventListeners();

        // ✅ Agregar nuevos event listeners
        document.getElementById('btnNuevaFinca')?.addEventListener('click', this.handleNuevaFinca.bind(this));
        document.getElementById('btnGuardarFinca')?.addEventListener('click', this.handleGuardarFinca.bind(this));

        // ✅ Delegación de eventos para botones dinámicos
        this.container.addEventListener('click', this.handleContainerClick.bind(this));
    }

    removeEventListeners() {
        // Remover event listeners específicos si existen
        const btnNueva = document.getElementById('btnNuevaFinca');
        const btnGuardar = document.getElementById('btnGuardarFinca');

        if (btnNueva) {
            btnNueva.replaceWith(btnNueva.cloneNode(true));
        }
        if (btnGuardar) {
            btnGuardar.replaceWith(btnGuardar.cloneNode(true));
        }
    }

    handleNuevaFinca() {
        this.openFincaModal();
    }

    handleGuardarFinca() {
        this.guardarFinca();
    }

    handleContainerClick(e) {
        if (e.target.closest('.btn-editar')) {
            const id = e.target.closest('.btn-editar').dataset.id;
            this.editarFinca(id);
        }

        if (e.target.closest('.btn-eliminar')) {
            const id = e.target.closest('.btn-eliminar').dataset.id;
            this.eliminarFinca(id);
        }

        if (e.target.closest('#btnCrearPrimeraFinca')) {
            this.openFincaModal();
        }
    }

    async loadFincas() {
        try {
            const fincas = await FincaService.getFincas();
            this.renderFincasTable(fincas);
        } catch (error) {
            this.showError('Error cargando fincas: ' + error.message);
        }
    }

    renderFincasTable(fincas) {
        const container = document.getElementById('fincasTableContainer');

        if (!fincas || fincas.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle mr-2"></i>
                    No hay fincas registradas. 
                    <button class="btn btn-sm btn-success ml-2" id="btnCrearPrimeraFinca">
                        <i class="fas fa-plus mr-1"></i> Crear primera finca
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-bordered table-hover table-striped">
                    <thead class="table-success">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Empresa</th>
                            <th>Ubicación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fincas.map(finca => {
            const empresa = this.empresas.find(emp => emp.id_empresa == finca.id_empresa);
            return `
                                <tr>
                                    <td>${finca.id_finca}</td>
                                    <td><strong>${finca.nombre}</strong></td>
                                    <td>${empresa ? empresa.nombre : 'N/A'}</td>
                                    <td>${finca.ubicacion || '-'}</td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-info btn-editar" data-id="${finca.id_finca}" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${finca.id_finca}" title="Eliminar">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async openFincaModal(finca = null) {
        this.fincaEditando = finca;
        const modal = new bootstrap.Modal(document.getElementById('fincaModal'));
        const title = document.getElementById('fincaModalTitle');
        const form = document.getElementById('fincaForm');

        if (finca) {
            title.textContent = 'Editar Finca';
            // Llenar form con datos existentes
            document.getElementById('id_empresa').value = finca.id_empresa || '';
            document.getElementById('nombre').value = finca.nombre || '';
            document.getElementById('ubicacion').value = finca.ubicacion || '';
        } else {
            title.textContent = 'Nueva Finca';
            form.reset();
        }

        modal.show();
    }

    async guardarFinca() {
        try {
            console.log('💾 Guardando finca...'); // Debug

            const formData = {
                id_empresa: parseInt(document.getElementById('id_empresa').value),
                nombre: document.getElementById('nombre').value,
                ubicacion: document.getElementById('ubicacion').value
            };

            if (!formData.id_empresa || !formData.nombre.trim()) {
                this.showError('La empresa y el nombre de la finca son obligatorios');
                return;
            }

            // ✅ Deshabilitar botón para evitar múltiples clics
            const btnGuardar = document.getElementById('btnGuardarFinca');
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';

            let result;
            if (this.fincaEditando) {
                result = await FincaService.updateFinca(this.fincaEditando.id_finca, formData);
                this.showSuccess('Finca actualizada correctamente');
            } else {
                result = await FincaService.createFinca(formData);
                this.showSuccess('Finca creada correctamente');
            }

            // Cerrar modal y recargar datos
            bootstrap.Modal.getInstance(document.getElementById('fincaModal')).hide();
            await this.loadFincas();

        } catch (error) {
            this.showError('Error guardando finca: ' + error.message);
        } finally {
            // ✅ Rehabilitar botón
            const btnGuardar = document.getElementById('btnGuardarFinca');
            if (btnGuardar) {
                btnGuardar.disabled = false;
                btnGuardar.innerHTML = '<i class="fas fa-save mr-1"></i> Guardar';
            }
        }
    }

    async editarFinca(id) {
        try {
            const fincas = await FincaService.getFincas();
            const finca = fincas.find(f => f.id_finca == id);
            if (finca) {
                this.openFincaModal(finca);
            } else {
                this.showError('Finca no encontrada');
            }
        } catch (error) {
            this.showError('Error cargando finca: ' + error.message);
        }
    }

    async eliminarFinca(id) {
        try {
            // ✅ Solo SweetAlert - sin confirm nativo
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer. La finca será eliminada permanentemente.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true,
                customClass: {
                    confirmButton: 'btn btn-danger',
                    cancelButton: 'btn btn-secondary'
                },
                buttonsStyling: false
            });

            // ✅ Si el usuario confirma la eliminación
            if (result.isConfirmed) {
                // Mostrar loading
                Swal.fire({
                    title: 'Eliminando...',
                    text: 'Por favor espere',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                await FincaService.deleteFinca(id);

                // ✅ Mostrar confirmación de éxito
                await Swal.fire({
                    title: '¡Eliminada!',
                    text: 'La finca ha sido eliminada correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#2E7D32',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn btn-success'
                    },
                    buttonsStyling: false
                });

                await this.loadFincas();
            }
        } catch (error) {
            // ✅ Mostrar error con SweetAlert
            await Swal.fire({
                title: 'Error',
                text: 'Error eliminando finca: ' + error.message,
                icon: 'error',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
                buttonsStyling: false
            });
        }
    }

    // ✅ Actualizar también showError y showSuccess para usar SweetAlert
    showError(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            customClass: {
                confirmButton: 'btn btn-danger'
            },
            buttonsStyling: false,
            timer: 5000,
            timerProgressBar: true
        });
    }

    showSuccess(message) {
        Swal.fire({
            title: 'Éxito',
            text: message,
            icon: 'success',
            confirmButtonColor: '#2E7D32',
            confirmButtonText: 'Aceptar',
            customClass: {
                confirmButton: 'btn btn-success'
            },
            buttonsStyling: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    showError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle mr-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const cardBody = this.container.querySelector('.card-body');
        cardBody.insertBefore(alertDiv, cardBody.firstChild);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="fas fa-check-circle mr-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const cardBody = this.container.querySelector('.card-body');
        cardBody.insertBefore(alertDiv, cardBody.firstChild);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }
}

export default FincasComponent;