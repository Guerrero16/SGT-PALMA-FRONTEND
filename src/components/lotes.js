import LoteService from '../services/loteService.js';
import FincaService from '../services/fincaService.js';
import Swal from 'sweetalert2';

class LotesComponent {
    constructor() {
        this.container = null;
        this.loteEditando = null;
        this.fincas = [];
        this.eventListenersBound = false;
    }

    async init(container) {
        this.container = container;
        await this.loadFincas();
        await this.render();
        await this.loadLotes();

        if (!this.eventListenersBound) {
            this.bindEvents();
            this.eventListenersBound = true;
        }
    }

    async loadFincas() {
        try {
            this.fincas = await FincaService.getFincas();
        } catch (error) {
            console.error('Error cargando fincas:', error);
            this.fincas = [];
        }
    }

    async render() {
        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card agri-card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h3 class="card-title m-0">
                                    <i class="fas fa-seedling me-2"></i> Gestión de Lotes
                                </h3>
                                <button class="btn btn-success" id="btnNuevoLote">
                                    <i class="fas fa-plus me-1"></i> Nuevo Lote
                                </button>
                            </div>
                            <div class="card-body">
                                <div id="lotesTableContainer" class="text-center py-4">
                                    <div class="spinner-border text-success" role="status"></div>
                                    <p class="mt-2">Cargando lotes...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal para crear/editar lote -->
            <div class="modal fade" id="loteModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="loteModalTitle">Nuevo Lote</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="loteForm">
                                <div class="mb-3">
                                    <label for="id_finca" class="form-label">Finca *</label>
                                    <select class="form-control" id="id_finca" required>
                                        <option value="">Seleccionar finca...</option>
                                        ${this.fincas.map(f => `<option value="${f.id_finca}">${f.nombre}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="nombre" class="form-label">Nombre del Lote *</label>
                                    <input type="text" class="form-control" id="nombre" required>
                                </div>
                                <div class="mb-3">
                                    <label for="ubicacion" class="form-label">Ubicación *</label>
                                    <textarea class="form-control" id="ubicacion" rows="2" placeholder="Ejemplo: Sector norte, cerca del río" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="num_lineas" class="form-label">Número de Líneas *</label>
                                    <input type="number" class="form-control" id="num_lineas" min="1" required placeholder="Ej: 10">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" id="btnGuardarLote">
                                <i class="fas fa-save me-1"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // ✅ eliminar posibles backdrops residuales
        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    }

    bindEvents() {
        console.log('🔗 Bind events - Lotes');
        this.removeEventListeners();

        document.getElementById('btnNuevoLote')?.addEventListener('click', () => this.openLoteModal());
        document.getElementById('btnGuardarLote')?.addEventListener('click', () => this.guardarLote());
        this.container.addEventListener('click', (e) => this.handleContainerClick(e));
    }

    removeEventListeners() {
        ['btnNuevoLote', 'btnGuardarLote'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.replaceWith(btn.cloneNode(true));
        });
    }

    async loadLotes() {
        try {
            const lotes = await LoteService.getLotes();
            this.renderLotesTable(lotes);
        } catch (error) {
            this.showError('Error cargando lotes: ' + error.message);
        }
    }

    renderLotesTable(lotes) {
        const container = document.getElementById('lotesTableContainer');

        if (!lotes || lotes.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay lotes registrados.
                    <button class="btn btn-sm btn-success ms-2" id="btnNuevoLote">
                        <i class="fas fa-plus me-1"></i> Crear primer lote
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-bordered table-hover table-striped align-middle">
                    <thead class="table-success">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Finca</th>
                            <th>Ubicación</th>
                            <th>N° Líneas</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lotes.map(lote => {
            const finca = this.fincas.find(f => f.id_finca == lote.id_finca);
            return `
                                <tr>
                                    <td>${lote.id_lote}</td>
                                    <td><strong>${lote.nombre}</strong></td>
                                    <td>${finca ? finca.nombre : 'N/A'}</td>
                                    <td>${lote.ubicacion || '-'}</td>
                                    <td>${lote.num_lineas || '-'}</td>
                                    <td class="text-center">
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-info btn-editar" data-id="${lote.id_lote}" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${lote.id_lote}" title="Eliminar">
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

    handleContainerClick(e) {
        if (e.target.closest('.btn-editar')) {
            const id = e.target.closest('.btn-editar').dataset.id;
            this.editarLote(id);
        }
        if (e.target.closest('.btn-eliminar')) {
            const id = e.target.closest('.btn-eliminar').dataset.id;
            this.eliminarLote(id);
        }
    }

    async openLoteModal(lote = null) {
        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

        this.loteEditando = lote;
        const modalEl = document.getElementById('loteModal');
        const modal = new bootstrap.Modal(modalEl);
        const title = document.getElementById('loteModalTitle');
        const form = document.getElementById('loteForm');

        if (lote) {
            title.textContent = 'Editar Lote';
            document.getElementById('id_finca').value = lote.id_finca || '';
            document.getElementById('nombre').value = lote.nombre || '';
            document.getElementById('ubicacion').value = lote.ubicacion || '';
            document.getElementById('num_lineas').value = lote.num_lineas || '';
        } else {
            title.textContent = 'Nuevo Lote';
            form.reset();
        }

        modal.show();
    }

    async guardarLote() {
        try {
            const formData = {
                id_finca: parseInt(document.getElementById('id_finca').value),
                nombre: document.getElementById('nombre').value.trim(),
                ubicacion: document.getElementById('ubicacion').value.trim(),
                num_lineas: parseInt(document.getElementById('num_lineas').value),
            };

            if (!formData.id_finca || !formData.nombre || !formData.ubicacion || !formData.num_lineas) {
                this.showError('Todos los campos marcados con * son obligatorios.');
                return;
            }

            const btnGuardar = document.getElementById('btnGuardarLote');
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';

            if (this.loteEditando) {
                await LoteService.updateLote(this.loteEditando.id_lote, formData);
                this.showSuccess('Lote actualizado correctamente.');
            } else {
                await LoteService.createLote(formData);
                this.showSuccess('Lote creado correctamente.');
            }

            // ✅ Cerrar modal y limpiar backdrop
            const modalEl = document.getElementById('loteModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            document.body.classList.remove('modal-open');
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

            await this.loadLotes();
        } catch (error) {
            this.showError('Error guardando lote: ' + error.message);
        } finally {
            const btnGuardar = document.getElementById('btnGuardarLote');
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="fas fa-save me-1"></i> Guardar';
        }
    }

    async editarLote(id) {
        try {
            const lotes = await LoteService.getLotes();
            const lote = lotes.find(l => l.id_lote == id);
            if (lote) this.openLoteModal(lote);
            else this.showError('Lote no encontrado.');
        } catch (error) {
            this.showError('Error cargando lote: ' + error.message);
        }
    }

    async eliminarLote(id) {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta acción eliminará el lote permanentemente.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            });

            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Eliminando...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });

                await LoteService.deleteLote(id);

                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El lote ha sido eliminado correctamente.',
                    icon: 'success',
                });

                await this.loadLotes();
            }
        } catch (error) {
            this.showError('Error eliminando lote: ' + error.message);
        }
    }

    showError(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#d33',
        });
    }

    showSuccess(message) {
        Swal.fire({
            title: 'Éxito',
            text: message,
            icon: 'success',
            confirmButtonColor: '#2E7D32',
        });
    }
}

export default LotesComponent;
