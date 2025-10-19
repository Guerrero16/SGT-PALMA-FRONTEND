import EmpresaService from "../services/empresaService.js";
import Swal from "sweetalert2";
import FincasComponent from "./fincas.js";

class EmpresasComponent {
  constructor() {
    this.container = null;
    this.empresaEditando = null;
    this.eventListenersBound = false;
  }

  async init(container) {
    this.container = container;
    await this.render();
    await this.loadEmpresas();

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
                                <div id="empresasTableContainer" class="text-center py-4">
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

            <!-- Modal para crear/editar empresa -->
            <div class="modal fade" id="empresaModal" tabindex="-1" aria-hidden="true">
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
                            <button type="button" class="btn btn-secondary" id="btnCancelarEmpresa" data-bs-dismiss="modal">Cancelar</button>
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
      this.empresas = empresas; // 👈 Guardamos para navegación
      this.renderEmpresasTable(empresas);
    } catch (error) {
      this.showError("Error cargando empresas: " + error.message);
    }
  }

  renderEmpresasTable(empresas) {
    const container = document.getElementById("empresasTableContainer");
    if (!empresas || empresas.length === 0) {
      container.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle mr-2"></i>
                    No hay empresas registradas. 
                    <button class="btn btn-sm btn-success ml-2" id="btnCrearPrimeraEmpresa">
                        <i class="fas fa-plus mr-1"></i> Crear primera empresa
                    </button>
                </div>`;
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
                        ${empresas
                          .map(
                            (e) => `
                            <tr>
                                <td>${e.id_empresa}</td>
                                <td><strong>${e.nombre}</strong></td>
                                <td>${e.nit || "-"}</td>
                                <td>${e.representante || "-"}</td>
                                <td>${e.telefono || "-"}</td>
                                <td>${
                                  e.direccion
                                    ? e.direccion.substring(0, 50) + "..."
                                    : "-"
                                }</td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-info btn-editar" data-id="${
                                          e.id_empresa
                                        }">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${
                                          e.id_empresa
                                        }">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        <button class="btn btn-sm btn-success btn-ver-fincas" data-id="${
                                          e.id_empresa
                                        }"               title="Ver Fincas">
                                            <i class="fas fa-map-marked-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>`
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>`;
  }

  bindEvents() {
    this.removeEventListeners();
    document
      .getElementById("btnNuevaEmpresa")
      ?.addEventListener("click", this.handleNuevaEmpresa.bind(this));
    document
      .getElementById("btnGuardarEmpresa")
      ?.addEventListener("click", this.handleGuardarEmpresa.bind(this));
    document
      .getElementById("btnCancelarEmpresa")
      ?.addEventListener("click", this.handleCancelarEmpresa.bind(this));
    this.container.addEventListener(
      "click",
      this.handleContainerClick.bind(this)
    );
  }

  removeEventListeners() {
    ["btnNuevaEmpresa", "btnGuardarEmpresa", "btnCancelarEmpresa"].forEach(
      (id) => {
        const btn = document.getElementById(id);
        if (btn) btn.replaceWith(btn.cloneNode(true));
      }
    );
  }

  handleNuevaEmpresa() {
    this.openEmpresaModal();
  }

  handleCancelarEmpresa() {
    this.closeModalSafely();
  }

  handleGuardarEmpresa() {
    this.guardarEmpresa();
  }

  handleContainerClick(e) {
    if (e.target.closest(".btn-editar")) {
      const id = e.target.closest(".btn-editar").dataset.id;
      this.editarEmpresa(id);
    }
    if (e.target.closest(".btn-eliminar")) {
      const id = e.target.closest(".btn-eliminar").dataset.id;
      this.eliminarEmpresa(id);
    }
    // 👇 Nuevo: Ver fincas de la empresa seleccionada
    if (e.target.closest(".btn-ver-fincas")) {
      const id = e.target.closest(".btn-ver-fincas").dataset.id;
      const empresa = this.empresas?.find((emp) => emp.id_empresa == id);
      if (empresa) this.verFincasDeEmpresa(empresa);
    }

    if (e.target.closest("#btnCrearPrimeraEmpresa")) {
      this.openEmpresaModal();
    }
  }

  closeModalSafely() {
    const modalEl = document.getElementById("empresaModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

    // 🔧 Solución al bug de bloqueo visual
    if (document.activeElement) document.activeElement.blur();
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
  }

  async openEmpresaModal(empresa = null) {
    this.empresaEditando = empresa;
    const modal = new bootstrap.Modal(document.getElementById("empresaModal"));
    const form = document.getElementById("empresaForm");
    document.getElementById("empresaModalTitle").textContent = empresa
      ? "Editar Empresa"
      : "Nueva Empresa";

    form.reset();
    if (empresa) {
      Object.keys(empresa).forEach((k) => {
        if (document.getElementById(k))
          document.getElementById(k).value = empresa[k] || "";
      });
    }
    modal.show();
  }

  async guardarEmpresa() {
    try {
      const formData = {
        nombre: document.getElementById("nombre").value.trim(),
        nit: document.getElementById("nit").value,
        direccion: document.getElementById("direccion").value,
        telefono: document.getElementById("telefono").value,
        representante: document.getElementById("representante").value,
        logo: document.getElementById("logo").value,
        firma: document.getElementById("firma").value,
      };

      if (!formData.nombre) return this.showError("El nombre es obligatorio");

      const btnGuardar = document.getElementById("btnGuardarEmpresa");
      btnGuardar.disabled = true;
      btnGuardar.innerHTML =
        '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';

      if (this.empresaEditando)
        await EmpresaService.updateEmpresa(
          this.empresaEditando.id_empresa,
          formData
        );
      else await EmpresaService.createEmpresa(formData);

      this.closeModalSafely();

      await Swal.fire({
        title: this.empresaEditando ? "¡Actualizada!" : "¡Creada!",
        text: "La empresa se guardó correctamente.",
        icon: "success",
        confirmButtonColor: "#2E7D32",
        confirmButtonText: "Aceptar",
        customClass: { confirmButton: "btn btn-success" },
        buttonsStyling: false,
      });

      await this.loadEmpresas();
    } catch (error) {
      this.showError("Error guardando empresa: " + error.message);
    } finally {
      const btnGuardar = document.getElementById("btnGuardarEmpresa");
      if (btnGuardar) {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '<i class="fas fa-save mr-1"></i> Guardar';
      }
    }
  }

  async editarEmpresa(id) {
    try {
      const empresas = await EmpresaService.getEmpresas();
      const empresa = empresas.find((e) => e.id_empresa == id);
      empresa
        ? this.openEmpresaModal(empresa)
        : this.showError("Empresa no encontrada");
    } catch (e) {
      this.showError("Error cargando empresa: " + e.message);
    }
  }

  async eliminarEmpresa(id) {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
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
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        await EmpresaService.deleteEmpresa(id);

        this.closeModalSafely();

        await Swal.fire({
          title: "¡Eliminada!",
          text: "La empresa ha sido eliminada correctamente.",
          icon: "success",
          confirmButtonColor: "#2E7D32",
          confirmButtonText: "Aceptar",
          customClass: { confirmButton: "btn btn-success" },
          buttonsStyling: false,
        });

        await this.loadEmpresas();
      }
    } catch (e) {
      this.showError("Error eliminando empresa: " + e.message);
    }
  }
  // 👇 NUEVO MÉTODO
  async verFincasDeEmpresa(empresa) {
    const container = this.container;
    const fincasComponent = new FincasComponent();

    // Limpiar el contenedor y mostrar breadcrumb
    container.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-secondary btn-volver-empresas mb-2">
                <i class="fas fa-arrow-left"></i> Volver a Empresas
            </button>
            <h4 class="mb-3 text-success">
                Fincas de la Empresa: <strong>${empresa.nombre}</strong>
            </h4>
        </div>
        <div id="submoduleContainer"></div>
    `;

    // Cargar fincas del id_empresa seleccionado
    const subContainer = container.querySelector("#submoduleContainer");
    await fincasComponent.init(subContainer, empresa.id_empresa);

    // Botón volver
    container
      .querySelector(".btn-volver-empresas")
      .addEventListener("click", () => {
        this.init(container);
      });
  }
  showError(msg) {
    this.closeModalSafely();
    Swal.fire({
      title: "Error",
      text: msg,
      icon: "error",
      confirmButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      customClass: { confirmButton: "btn btn-danger" },
      buttonsStyling: false,
    });
  }
}

export default EmpresasComponent;
