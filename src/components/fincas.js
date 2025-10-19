import FincaService from "../services/fincaService.js";
import EmpresaService from "../services/empresaService.js";
import LotesComponent from "./lotes.js";
import Swal from "sweetalert2";

class FincasComponent {
    constructor() {
        this.container = null;
        this.fincaEditando = null;
        this.empresas = [];
        this.eventListenersBound = false;
    }

    async init(container, id_empresa = null) {
        this.container = container;
        this.id_empresa = id_empresa; // 👈 guardamos el id si viene
        await this.loadEmpresas();
        await this.render();
        await this.loadFincas();

        // Siempre volvemos a enlazar eventos en cada carga de módulo
        this.bindEvents();

    }

    async loadEmpresas() {
        try {
            this.empresas = await EmpresaService.getEmpresas();
        } catch (error) {
            console.error("Error cargando empresas:", error);
            this.empresas = [];
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
                                    <i class="fas fa-map-marked-alt me-2"></i> Gestión de Fincas
                                </h3>
                                <button class="btn btn-success" id="btnNuevaFinca">
                                    <i class="fas fa-plus me-1"></i> Nueva Finca
                                </button>
                            </div>
                            <div class="card-body">
                                <div id="fincasTableContainer" class="text-center py-4">
                                    <div class="spinner-border text-success" role="status"></div>
                                    <p class="mt-2">Cargando fincas...</p>
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
                                        ${this.empresas
                .map(e =>
                    `<option value="${e.id_empresa}" ${this.id_empresa == e.id_empresa ? 'selected' : ''}>
                                                ${e.nombre}
                                            </option>`
                )
                .join('')}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="nombre" class="form-label">Nombre de la Finca *</label>
                                    <input type="text" class="form-control" id="nombre" required>
                                </div>
                                <div class="mb-3">
                                    <label for="ubicacion" class="form-label">Ubicación</label>
                                    <textarea class="form-control" id="ubicacion" rows="3" placeholder="Dirección o coordenadas..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" id="btnGuardarFinca">
                                <i class="fas fa-save me-1"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // ✅ Siempre limpiar backdrop anterior antes de mostrar uno nuevo
        document.body.classList.remove("modal-open");
        document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    }

    bindEvents() {
        console.log("🔗 Bind events - Fincas");
        this.removeEventListeners();

        document
            .getElementById("btnNuevaFinca")
            ?.addEventListener("click", () => this.openFincaModal());
        document
            .getElementById("btnGuardarFinca")
            ?.addEventListener("click", () => this.guardarFinca());
        this.container.addEventListener("click", (e) =>
            this.handleContainerClick(e)
        );
    }

    removeEventListeners() {
        ["btnNuevaFinca", "btnGuardarFinca"].forEach((id) => {
            const btn = document.getElementById(id);
            if (btn) btn.replaceWith(btn.cloneNode(true));
        });
    }

    async loadFincas() {
        try {
            let fincas = [];
            if (this.id_empresa) {
                fincas = await FincaService.getFincasByEmpresa(this.id_empresa);
            } else {
                fincas = await FincaService.getFincas();
            }
            this.fincas = fincas;
            this.renderFincasTable(fincas);
        } catch (error) {
            this.showError('Error cargando fincas: ' + error.message);
        }
    }


    renderFincasTable(fincas) {
        const container = document.getElementById("fincasTableContainer");

        if (!fincas || fincas.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay fincas registradas.
                    <button class="btn btn-sm btn-success ms-2" id="btnCrearPrimeraFinca">
                        <i class="fas fa-plus me-1"></i> Crear primera finca
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
                            <th>Empresa</th>
                            <th>Ubicación</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fincas
                .map((finca) => {
                    const empresa = this.empresas.find(
                        (e) => e.id_empresa == finca.id_empresa
                    );
                    return `
                                <tr>
                                    <td>${finca.id_finca}</td>
                                    <td><strong>${finca.nombre}</strong></td>
                                    <td>${empresa ? empresa.nombre : "N/A"}</td>
                                    <td>${finca.ubicacion || "-"}</td>
                                    <td class="text-center">
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-info btn-editar" data-id="${finca.id_finca
                        }" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${finca.id_finca
                        }" title="Eliminar">
                                                <i class="fas fa-trash"></i>
                                            </button>
              <button class="btn btn-sm btn-success btn-ver-lotes" data-id="${finca.id_finca}" title="Ver Lotes">
            <i class="fas fa-seedling"></i>
        </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                })
                .join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    handleContainerClick(e) {
        if (e.target.closest(".btn-editar")) {
            const id = e.target.closest(".btn-editar").dataset.id;
            this.editarFinca(id);
        }
        if (e.target.closest(".btn-eliminar")) {
            const id = e.target.closest(".btn-eliminar").dataset.id;
            this.eliminarFinca(id);
        }
        if (e.target.closest("#btnCrearPrimeraFinca")) {
            this.openFincaModal();
        }
        // 👇 Nuevo: Ver lotes de la finca seleccionada
        if (e.target.closest('.btn-ver-lotes')) {
            const id = e.target.closest('.btn-ver-lotes').dataset.id;
            const finca = this.fincas?.find(f => f.id_finca == id);
            if (finca) this.verLotesDeFinca(finca);
        }

    }

    async openFincaModal(finca = null) {
        // ✅ Limpieza visual previa (elimina restos de modales anteriores)
        document.activeElement?.blur();
        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

        const modalEl = document.getElementById('fincaModal');
        if (!modalEl) {
            console.error('⚠️ No se encontró el modal fincaModal en el DOM');
            this.showError('No se pudo abrir el formulario de finca.');
            return;
        }

        // ✅ Destruir instancia previa si existe
        const existingInstance = bootstrap.Modal.getInstance(modalEl);
        if (existingInstance) {
            existingInstance.hide();
            existingInstance.dispose();
        }

        // ✅ Crear nueva instancia segura
        const modal = new bootstrap.Modal(modalEl, {
            backdrop: 'static',
            keyboard: false
        });

        const title = document.getElementById('fincaModalTitle');
        const form = document.getElementById('fincaForm');

        // ✅ Rellenar datos o limpiar formulario
        if (finca) {
            this.fincaEditando = finca;
            title.textContent = 'Editar Finca';
            document.getElementById('id_empresa').value = finca.id_empresa || '';
            document.getElementById('nombre').value = finca.nombre || '';
            document.getElementById('ubicacion').value = finca.ubicacion || '';
        } else {
            this.fincaEditando = null;
            title.textContent = 'Nueva Finca';
            form.reset();

            // Si vienes desde empresa, bloquear selector
            if (this.id_empresa) {
                const empresaSelect = document.getElementById('id_empresa');
                empresaSelect.value = this.id_empresa;
                empresaSelect.disabled = true;
            }
        }

        // ✅ Mostrar el modal de forma segura
        try {
            const isVisible = modalEl.classList.contains('show');
            if (!isVisible) modal.show();
        } catch (err) {
            console.error('❌ Error al mostrar modal finca:', err);
            this.showError('No se pudo abrir el formulario de finca.');
        }

        // ✅ Limpieza final (evita duplicación de backdrops)
        setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach((el, i) => {
                if (i > 0) el.remove();
            });
        }, 150);
    }



    async guardarFinca() {
        try {
            const formData = {
                id_empresa: parseInt(document.getElementById("id_empresa").value),
                nombre: document.getElementById("nombre").value.trim(),
                ubicacion: document.getElementById("ubicacion").value,
            };

            if (!formData.id_empresa || !formData.nombre) {
                this.showError("La empresa y el nombre de la finca son obligatorios.");
                return;
            }

            const btnGuardar = document.getElementById("btnGuardarFinca");
            btnGuardar.disabled = true;
            btnGuardar.innerHTML =
                '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';

            if (this.fincaEditando) {
                await FincaService.updateFinca(this.fincaEditando.id_finca, formData);
                this.showSuccess("Finca actualizada correctamente.");
            } else {
                await FincaService.createFinca(formData);
                this.showSuccess("Finca creada correctamente.");
            }

            document.activeElement?.blur(); // ✅ evita el warning aria-hidden
            const modalEl = document.getElementById('fincaModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
                modalInstance.dispose(); // ✅ destruye la instancia y evita error backdrop
            }
            document.body.classList.remove('modal-open');
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());


            // ✅ Quitar el fondo bloqueado
            document.body.classList.remove("modal-open");
            document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());

            await this.loadFincas(this.id_empresa);
            await new Promise((r) => setTimeout(r, 200));
        } catch (error) {
            this.showError("Error guardando finca: " + error.message);
        } finally {
            const btnGuardar = document.getElementById("btnGuardarFinca");
            if (btnGuardar) {
                btnGuardar.disabled = false;
                btnGuardar.innerHTML = '<i class="fas fa-save me-1"></i> Guardar';
            }
        }
    }

    // 🔧 REEMPLAZAR MÉTODO COMPLETO
    async editarFinca(id) {
        try {
            const finca = this.fincas?.find(f => f.id_finca == id);
            if (!finca) {
                this.showError("Finca no encontrada.");
                return;
            }

            // 🔧 Evita interferencia visual de Bootstrap
            document.activeElement?.blur();
            document.body.classList.remove('modal-open');
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

            // ✅ Abrir modal de edición
            this.openFincaModal(finca);

        } catch (error) {
            this.showError("Error cargando finca: " + error.message);
        }
    }


    async eliminarFinca(id) {
        try {
            const result = await Swal.fire({
                title: "¿Estás seguro?",
                text: "Esta acción no se puede deshacer. La finca será eliminada permanentemente.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
                reverseButtons: true,
                customClass: {
                    confirmButton: "btn btn-danger",
                    cancelButton: "btn btn-secondary",
                },
                buttonsStyling: false,
            });

            if (result.isConfirmed) {
                Swal.fire({
                    title: "Eliminando...",
                    text: "Por favor espere",
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });

                await FincaService.deleteFinca(id);

                await Swal.fire({
                    title: "¡Eliminada!",
                    text: "La finca ha sido eliminada correctamente.",
                    icon: "success",
                    confirmButtonColor: "#2E7D32",
                    confirmButtonText: "Aceptar",
                    customClass: {
                        confirmButton: "btn btn-success",
                    },
                    buttonsStyling: false,
                });

                await this.loadFincas();
            }
        } catch (error) {
            this.showError("Error eliminando finca: " + error.message);
        }
    }
    // 👇 NUEVO MÉTODO
    async verLotesDeFinca(finca) {
        const container = this.container;
        const lotesComponent = new LotesComponent();

        // Reemplazar contenido con breadcrumb
        container.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-secondary btn-volver-fincas mb-2">
                <i class="fas fa-arrow-left"></i> Volver a Fincas
            </button>
            <h4 class="mb-3 text-success">
                Lotes de la Finca: <strong>${finca.nombre}</strong>
            </h4>
        </div>
        <div id="submoduleContainer"></div>
    `;

        // Cargar lotes de la finca seleccionada
        const subContainer = container.querySelector('#submoduleContainer');
        await lotesComponent.init(subContainer, finca.id_finca);

        // Botón para volver a la lista de fincas
        container.querySelector('.btn-volver-fincas').addEventListener('click', () => {
            this.init(container, this.id_empresa);
        });
    }

    showError(message) {
        Swal.fire({
            title: "Error",
            text: message,
            icon: "error",
            confirmButtonColor: "#d33",
            confirmButtonText: "Aceptar",
            customClass: { confirmButton: "btn btn-danger" },
            buttonsStyling: false,
            timer: 5000,
            timerProgressBar: true,
        });
    }

    showSuccess(message) {
        Swal.fire({
            title: "Éxito",
            text: message,
            icon: "success",
            confirmButtonColor: "#2E7D32",
            confirmButtonText: "Aceptar",
            customClass: { confirmButton: "btn btn-success" },
            buttonsStyling: false,
            timer: 3000,
            timerProgressBar: true,
        });
    }
}

export default FincasComponent;
