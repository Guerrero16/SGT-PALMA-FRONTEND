// src/components/lotes.js
import LoteService from '../services/loteService.js';
import FincaService from '../services/fincaService.js';

class LotesComponent {
    constructor() {
        this.lotes = [];
        this.fincas = [];
        this.filteredLotes = [];
    }

    async init(container) {
        this.container = container;
        await this.render();
        await this.loadData();
        this.setupEventListeners();
    }

    async loadData() {
        try {
            this.showLoading();

            // Cargar datos en paralelo
            const [lotesData, fincasData] = await Promise.all([
                LoteService.getLotes(),
                FincaService.getFincas()
            ]);

            this.lotes = lotesData;
            this.fincas = fincasData;
            this.filteredLotes = [...this.lotes];

            await this.renderTable();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Error al cargar los datos: ' + error.message);
        }
    }

    showLoading() {
        const tableContainer = this.container.querySelector('#lotes-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="height: 100px">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>
            `;
        }
    }

    showError(message) {
        const tableContainer = this.container.querySelector('#lotes-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                </div>
            `;
        }
    }

    async render() {
        this.container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h3 class="card-title mb-0">
                                <i class="fas fa-tags me-2"></i>
                                Gestión de Lotes
                            </h3>
                            <button class="btn btn-light btn-sm" id="btnNuevoLote">
                                <i class="fas fa-plus me-2"></i>
                                Nuevo Lote
                            </button>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="input-group">
                                        <input type="text" class="form-control" placeholder="Buscar lotes..." id="searchInput">
                                        <button class="btn btn-outline-secondary" type="button" id="btnSearch">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div id="lotes-table-container">
                                <div class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Cargando...</span>
                                    </div>
                                    <p class="mt-2">Cargando lotes...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderTable() {
        const tableContainer = this.container.querySelector('#lotes-table-container');
        if (!tableContainer) return;

        if (this.filteredLotes.length === 0) {
            tableContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h4>No hay lotes registrados</h4>
                    <p class="text-muted">Comienza agregando un nuevo lote.</p>
                    <button class="btn btn-primary" id="btnEmptyCreate">
                        <i class="fas fa-plus me-2"></i>
                        Crear Primer Lote
                    </button>
                </div>
            `;
            return;
        }

        tableContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Ubicación</th>
                            <th>N° Líneas</th>
                            <th>Finca</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredLotes.map(lote => `
                            <tr>
                                <td>${lote.id_lote}</td>
                                <td><strong>${this.escapeHtml(lote.nombre)}</strong></td>
                                <td>${this.escapeHtml(lote.ubicacion)}</td>
                                <td><span class="badge bg-info">${lote.num_lineas}</span></td>
                                <td><span class="badge bg-secondary">${lote.finca_nombre || `Finca ${lote.id_finca}`}</span></td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-warning btn-edit" data-id="${lote.id_lote}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-danger btn-delete" data-id="${lote.id_lote}">
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupEventListeners() {
        // Event delegation para todos los botones
        this.container.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.id === 'btnNuevoLote' || target.id === 'btnEmptyCreate') {
                this.showLoteForm();
            }

            if (target.classList.contains('btn-edit')) {
                const id = target.getAttribute('data-id');
                this.editLote(parseInt(id));
            }

            if (target.classList.contains('btn-delete')) {
                const id = target.getAttribute('data-id');
                this.deleteLote(parseInt(id));
            }
        });

        // Búsqueda
        const searchInput = this.container.querySelector('#searchInput');
        const btnSearch = this.container.querySelector('#btnSearch');

        const performSearch = () => {
            const searchTerm = searchInput.value.toLowerCase();
            this.filteredLotes = this.lotes.filter(lote =>
                lote.nombre.toLowerCase().includes(searchTerm) ||
                lote.ubicacion.toLowerCase().includes(searchTerm) ||
                (lote.finca_nombre && lote.finca_nombre.toLowerCase().includes(searchTerm))
            );
            this.renderTable();
        };

        if (btnSearch) btnSearch.addEventListener('click', performSearch);
        if (searchInput) {
            searchInput.addEventListener('input', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }
    }

    async showLoteForm(lote = null) {
        const isEdit = !!lote;

        try {
            const { value: formValues } = await Swal.fire({
                title: isEdit ? 'Editar Lote' : 'Nuevo Lote',
                html: `
                    <form id="loteForm">
                        <div class="mb-3">
                            <label for="id_finca" class="form-label">Finca *</label>
                            <select class="form-select" id="id_finca" required>
                                <option value="">Seleccionar finca...</option>
                                ${this.fincas.map(finca => `
                                    <option value="${finca.id_finca}" ${isEdit && lote.id_finca === finca.id_finca ? 'selected' : ''}>
                                        ${this.escapeHtml(finca.nombre)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="nombre" class="form-label">Nombre del Lote *</label>
                            <input type="text" class="form-control" id="nombre" value="${isEdit ? this.escapeHtml(lote.nombre) : ''}" required>
                        </div>
                        <div class="mb-3">
                            <label for="ubicacion" class="form-label">Ubicación *</label>
                            <input type="text" class="form-control" id="ubicacion" value="${isEdit ? this.escapeHtml(lote.ubicacion) : ''}" required>
                        </div>
                        <div class="mb-3">
                            <label for="num_lineas" class="form-label">Número de Líneas *</label>
                            <input type="number" class="form-control" id="num_lineas" value="${isEdit ? lote.num_lineas : ''}" min="1" required>
                        </div>
                    </form>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: isEdit ? 'Actualizar' : 'Crear',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const id_finca = document.getElementById('id_finca').value;
                    const nombre = document.getElementById('nombre').value;
                    const ubicacion = document.getElementById('ubicacion').value;
                    const num_lineas = document.getElementById('num_lineas').value;

                    if (!id_finca || !nombre || !ubicacion || !num_lineas) {
                        Swal.showValidationMessage('Todos los campos son obligatorios');
                        return false;
                    }

                    if (num_lineas < 1) {
                        Swal.showValidationMessage('El número de líneas debe ser mayor a 0');
                        return false;
                    }

                    return {
                        id_finca: parseInt(id_finca),
                        nombre: nombre.trim(),
                        ubicacion: ubicacion.trim(),
                        num_lineas: parseInt(num_lineas)
                    };
                }
            });

            if (formValues) {
                if (isEdit) {
                    await LoteService.updateLote(lote.id_lote, formValues);
                    Swal.fire('¡Actualizado!', 'Lote actualizado correctamente.', 'success');
                } else {
                    await LoteService.createLote(formValues);
                    Swal.fire('¡Creado!', 'Lote creado correctamente.', 'success');
                }
                await this.loadData();
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }

    async editLote(id) {
        try {
            const lote = await LoteService.getLote(id);
            await this.showLoteForm(lote);
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }

    async deleteLote(id) {
        const lote = this.lotes.find(l => l.id_lote === id);
        if (!lote) return;

        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `¿Quieres eliminar el lote "${lote.nombre}"? Esta acción no se puede deshacer.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                await LoteService.deleteLote(id);
                Swal.fire('¡Eliminado!', 'El lote ha sido eliminado correctamente.', 'success');
                await this.loadData();
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
}

export default LotesComponent;