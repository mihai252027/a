document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("fileInput");
    const fileList = document.getElementById("fileList");
    const count = document.getElementById("count");

    const request = indexedDB.open("MiEspacioPersonal", 1);

    request.onupgradeneeded = (event) => {
        event.target.result.createObjectStore("files", {
            keyPath: "id",
            autoIncrement: true
        });
    };

    request.onerror = () => {
        console.error("Error con IndexedDB:", request.error);
        alert("No se pudo activar el almacenamiento del navegador.");
    };

    request.onsuccess = () => {
        const db = request.result;
        mostrarArchivos(db);

        input.addEventListener("change", () => {
            if (input.files.length === 0) return;

            const transaction = db.transaction("files", "readwrite");
            const store = transaction.objectStore("files");

            for (const file of input.files) {
                store.add({
                    nombre: file.name,
                    tipo: file.type,
                    tamano: file.size,
                    archivo: file,
                    fecha: new Date().toLocaleString()
                });
            }

            transaction.oncomplete = () => {
                input.value = "";
                mostrarArchivos(db);
            };

            transaction.onerror = () => {
                console.error(transaction.error);
                alert("No se pudo guardar el archivo.");
            };
        });
    };
});

function mostrarArchivos(db) {
    const transaction = db.transaction("files", "readonly");
    const store = transaction.objectStore("files");
    const request = store.getAll();

    request.onsuccess = () => {
        const archivos = request.result;

        document.getElementById("count").textContent =
            `${archivos.length} archivo${archivos.length === 1 ? "" : "s"}`;

        const lista = document.getElementById("fileList");
        lista.innerHTML = "";

        if (archivos.length === 0) {
            lista.innerHTML =
                '<div class="empty">Todavía no has guardado ningún archivo.</div>';
            return;
        }

        archivos.forEach((archivo) => {
            const elemento = document.createElement("div");
            elemento.className = "file";

            const enlace = document.createElement("a");
            enlace.textContent = "Descargar";
            enlace.className = "button";
            enlace.download = archivo.nombre;
            enlace.href = URL.createObjectURL(archivo.archivo);

            const texto = document.createElement("span");
            texto.textContent = `${archivo.nombre} (${archivo.fecha})`;

            elemento.append(texto, enlace);
            lista.appendChild(elemento);
        });
    };
}