import EmpresaService from '../services/empresaService.js';
import Swal from 'sweetalert2'; // ✅ Importar SweetAlert2

class EmpresasComponent {
    constructor() {
        this.container = null;
        this.empresaEditando = null;
        this.addEventListenersBound = false;
    }

    async init(container) {
        this.container = container;
        await this.render();
        await this.loadEmpresas();

        // ✅ Solo bindear eventos una vez
        if (!this.eventListenersBound) {
            this.bindEvents();
            this.eventListenersBound = true;
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
                                    <i class="fas fa-building mr-2"></i>
                                    Gestión de Empresas
                                </h3>
                                <div class="card-tools">
                                    <button class="btn btn-success" id="btnNuevaEmpresa">
                                        <i class="fas fa-plus mr-1"></i> Nueva Empresa
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="empresasTableContainer">
                                    <div class="text-center py-4">
                                        <div class="spinner-border text-success" role="status">
                                            <span class="visually-hidden">Cargando...</span>
                                        </div>
                                        <p class="mt-2">Cargando empresas...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal para crear/editar empresa -->
            <div class="modal fade" id="empresaModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="empresaModalTitle">Nueva Empresa</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="empresaForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="nombre" class="form-label">Nombre *</label>
                                            <input type="text" class="form-control" id="nombre" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="nit" class="form-label">NIT</label>
                                            <input type="text" class="form-control" id="nit">
                                        </div>
                                        <div class="mb-3">
                                            <label for="telefono" class="form-label">Teléfono</label>
                                            <input type="text" class="form-control" id="telefono">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="representante" class="form-label">Representante</label>
                                            <input type="text" class="form-control" id="representante">
                                        </div>
                                        <div class="mb-3">
                                            <label for="direccion" class="form-label">Dirección</label>
                                            <textarea class="form-control" id="direccion" rows="3"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="logo" class="form-label">Logo (URL)</label>
                                            <input type="text" class="form-control" id="logo">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="firma" class="form-label">Firma (URL)</label>
                                            <input type="text" class="form-control" id="firma">
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" id="btnGuardarEmpresa">
                                <i class="fas fa-save mr-1"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }


    async loadEmpresas() {
        try {
            const empresas = await EmpresaService.getEmpresas();
            this.renderEmpresasTable(empresas);
        } catch (error) {
            this.showError('Error cargando empresas: ' + error.message);
        }
    }

    renderEmpresasTable(empresas) {
        const container = document.getElementById('empresasTableContainer');

        if (!empresas || empresas.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle mr-2"></i>
                    No hay empresas registradas. 
                    <button class="btn btn-sm btn-success ml-2" id="btnCrearPrimeraEmpresa">
                        <i class="fas fa-plus mr-1"></i> Crear primera empresa
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
                            <th>NIT</th>
                            <th>Representante</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${empresas.map(empresa => `
                            <tr>
                                <td>${empresa.id_empresa}</td>
                                <td><strong>${empresa.nombre}</strong></td>
                                <td>${empresa.nit || '-'}</td>
                                <td>${empresa.representante || '-'}</td>
                                <td>${empresa.telefono || '-'}</td>
                                <td>${empresa.direccion ? empresa.direccion.substring(0, 50) + '...' : '-'}</td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-info btn-editar" data-id="${empresa.id_empresa}" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${empresa.id_empresa}" title="Eliminar">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    bindEvents() {
        console.log('🔗 Bind events - Empresas'); // Para debug

        // ✅ Remover event listeners anteriores primero
        this.removeEventListeners();

        // ✅ Agregar nuevos event listeners
        document.getElementById('btnNuevaEmpresa')?.addEventListener('click', this.handleNuevaEmpresa.bind(this));
        document.getElementById('btnGuardarEmpresa')?.addEventListener('click', this.handleGuardarEmpresa.bind(this));

        // ✅ Delegación de eventos para botones dinámicos
        this.container.addEventListener('click', this.handleContainerClick.bind(this));
    }

    removeEventListeners() {
        // Remover event listeners específicos si existen
        const btnNueva = document.getElementById('btnNuevaEmpresa');
        const btnGuardar = document.getElementById('btnGuardarEmpresa');

        if (btnNueva) {
            btnNueva.replaceWith(btnNueva.cloneNode(true));
        }
        if (btnGuardar) {
            btnGuardar.replaceWith(btnGuardar.cloneNode(true));
        }
    }

    handleNuevaEmpresa() {
        this.openEmpresaModal();
    }

    handleGuardarEmpresa() {
        this.guardarEmpresa();
    }

    handleContainerClick(e) {
        if (e.target.closest('.btn-editar')) {
            const id = e.target.closest('.btn-editar').dataset.id;
            this.editarEmpresa(id);
        }

        if (e.target.closest('.btn-eliminar')) {
            const id = e.target.closest('.btn-eliminar').dataset.id;
            this.eliminarEmpresa(id);
        }

        if (e.target.closest('#btnCrearPrimeraEmpresa')) {
            this.openEmpresaModal();
        }
    }

    async openEmpresaModal(empresa = null) {
        this.empresaEditando = empresa;
        const modal = new bootstrap.Modal(document.getElementById('empresaModal'));
        const title = document.getElementById('empresaModalTitle');
        const form = document.getElementById('empresaForm');

        if (empresa) {
            title.textContent = 'Editar Empresa';
            // Llenar form con datos existentes
            document.getElementById('nombre').value = empresa.nombre || '';
            document.getElementById('nit').value = empresa.nit || '';
            document.getElementById('direccion').value = empresa.direccion || '';
            document.getElementById('telefono').value = empresa.telefono || '';
            document.getElementById('representante').value = empresa.representante || '';
            document.getElementById('logo').value = empresa.logo || '';
            document.getElementById('firma').value = empresa.firma || '';
        } else {
            title.textContent = 'Nueva Empresa';
            form.reset();
        }

        modal.show();
    }

    async guardarEmpresa() {
        try {
            console.log('💾 Guardando empresa...');

            const formData = {
                nombre: document.getElementById('nombre').value,
                nit: document.getElementById('nit').value,
                direccion: document.getElementById('direccion').value,
                telefono: document.getElementById('telefono').value,
                representante: document.getElementById('representante').value,
                logo: document.getElementById('logo').value,
                firma: document.getElementById('firma').value
            };

            if (!formData.nombre.trim()) {
                this.showError('El nombre de la empresa es obligatorio');
                return;
            }

            // ✅ Deshabilitar botón y mostrar loading
            const btnGuardar = document.getElementById('btnGuardarEmpresa');
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';

            let result;
            if (this.empresaEditando) {
                result = await EmpresaService.updateEmpresa(this.empresaEditando.id_empresa, formData);

                // ✅ Cerrar modal primero
                bootstrap.Modal.getInstance(document.getElementById('empresaModal')).hide();

                // ✅ Mostrar éxito con SweetAlert
                await Swal.fire({
                    title: '¡Actualizada!',
                    text: 'La empresa ha sido actualizada correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#2E7D32',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn btn-success'
                    },
                    buttonsStyling: false
                });
            } else {
                result = await EmpresaService.createEmpresa(formData);

                // ✅ Cerrar modal primero
                bootstrap.Modal.getInstance(document.getElementById('empresaModal')).hide();

                // ✅ Mostrar éxito con SweetAlert
                await Swal.fire({
                    title: '¡Creada!',
                    text: 'La empresa ha sido creada correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#2E7D32',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn btn-success'
                    },
                    buttonsStyling: false
                });
            }

            await this.loadEmpresas();

        } catch (error) {
            // ✅ Mostrar error con SweetAlert
            await Swal.fire({
                title: 'Error',
                text: 'Error guardando empresa: ' + error.message,
                icon: 'error',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
                buttonsStyling: false
            });
        } finally {
            // ✅ Rehabilitar botón
            const btnGuardar = document.getElementById('btnGuardarEmpresa');
            if (btnGuardar) {
                btnGuardar.disabled = false;
                btnGuardar.innerHTML = '<i class="fas fa-save mr-1"></i> Guardar';
            }
        }
    }

    async eliminarEmpresa(id) {
        try {
            // ✅ Solo SweetAlert - sin confirm nativo
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer. La empresa será eliminada permanentemente.",
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

                await EmpresaService.deleteEmpresa(id);

                // ✅ Mostrar confirmación de éxito
                await Swal.fire({
                    title: '¡Eliminada!',
                    text: 'La empresa ha sido eliminada correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#2E7D32',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn btn-success'
                    },
                    buttonsStyling: false
                });

                await this.loadEmpresas();
            }
        } catch (error) {
            // ✅ Mostrar error con SweetAlert
            await Swal.fire({
                title: 'Error',
                text: 'Error eliminando empresa: ' + error.message,
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

}

export default EmpresasComponent;