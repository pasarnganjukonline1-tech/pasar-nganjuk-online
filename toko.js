
// =====================================
// HALAMAN DETAIL TOKO
// =====================================
let produkTokoAktif = [];
// Ambil ID toko dari alamat halaman
const parameterURL = new URLSearchParams(window.location.search);
const tokoId = parameterURL.get("id");

// Format harga
function formatHargaToko(harga) {
    return Number(harga).toLocaleString("id-ID");
}

// Muat detail toko
async function muatDetailToko() {
    const profil = document.getElementById("profilToko");
    const daftarProduk = document.getElementById("daftarProdukToko");

    if (!tokoId) {
     profil.innerHTML = `
    <div class="banner-toko">
        ${
            toko.banner_toko_url
            ? `<img src="${escapeHTMLToko(toko.banner_toko_url)}" alt="Banner toko">`
            : `<div class="banner-kosong">Selamat Datang di Toko Kami</div>`
        }
    </div>

    <div class="kartu-profil-toko">
        <div class="identitas-toko">
            ${
                toko.foto_toko_url
                ? `<img class="foto-profil-toko" src="${escapeHTMLToko(toko.foto_toko_url)}" alt="Foto toko">`
                : `<div class="foto-profil-kosong">🏪</div>`
            }

            <div class="info-identitas-toko">
                <h1>${escapeHTMLToko(toko.nama_toko)}</h1>
                <p>👤 Pemilik: ${escapeHTMLToko(toko.nama_pemilik || "-")}</p>
                <p>📍 Lokasi: ${escapeHTMLToko(toko.lokasi || "-")}</p>

                <p class="deskripsi-toko">
                    ${escapeHTMLToko(toko.deskripsi || "Belum ada deskripsi toko.")}
                </p>

                ${
                    toko.whatsapp
                    ? `<a class="tombol-whatsapp"
                        href="https://wa.me/${toko.whatsapp.replace(/\D/g, "")}"
                        target="_blank"
                        rel="noopener noreferrer">
                        💬 Chat Penjual via WhatsApp
                    </a>`
                    : ""
                }
            </div>
        </div>
    </div>
`; 
    }

    try {
        // AMBIL PROFIL TOKO
       const { data: toko, error: tokoError } = await supabaseClient
    .from("toko")
    .select("*")
    .eq("id", tokoId)
    .eq("status", "aktif")
    .single();

        if (tokoError) throw tokoError;

        
profil.innerHTML = `
    <div class="banner-toko">
        ${
            toko.banner_toko_url
            ? `<img src="${escapeHTMLToko(toko.banner_toko_url)}" alt="Banner toko">`
            : `<div class="banner-kosong">Selamat Datang di Toko Kami</div>`
        }
    </div>

    <div class="kartu-profil-toko">
        <div class="identitas-toko">
            ${
                toko.foto_toko_url
                ? `<img class="foto-profil-toko"
                    src="${escapeHTMLToko(toko.foto_toko_url)}"
                    alt="Foto toko">`
                : `<div class="foto-profil-kosong">🏪</div>`
            }

            <div class="info-identitas-toko">
                <h1>${escapeHTMLToko(toko.nama_toko)}</h1>

                <p>👤 Pemilik: ${escapeHTMLToko(toko.nama_pemilik || "-")}</p>

                <p>📍 Lokasi: ${escapeHTMLToko(toko.lokasi || "-")}</p>

                <p class="deskripsi-toko">
                    ${escapeHTMLToko(toko.deskripsi || "Belum ada deskripsi toko.")}
                </p>

                ${
                    toko.whatsapp
                    ? `<a class="tombol-whatsapp"
                        href="https://wa.me/${toko.whatsapp.replace(/\D/g, "")}"
                        target="_blank"
                        rel="noopener noreferrer">
                        💬 Chat Penjual via WhatsApp
                    </a>`
                    : ""
                }
            </div>
        </div>
    </div>
`;


        // AMBIL PRODUK TOKO
        const { data: produk, error: produkError } = await supabaseClient
    .from("produk")
    .select("*")
    .eq("toko_id", tokoId)
.eq("status", "aktif")
.eq("status_admin", "aktif")
.order("created_at", { ascending: false });

if (produkError) throw produkError;

produkTokoAktif = produk || [];
        if (produkError) throw produkError;


        if (!produk || produk.length === 0) {
    daftarProduk.innerHTML = "<p>Toko ini belum memiliki produk.</p>";
    return;
}

// Fungsi menampilkan produk

// Fungsi menampilkan produk
function tampilkanProdukToko(data) {
    if (data.length === 0) {
        daftarProduk.innerHTML = "<p>Produk tidak ditemukan.</p>";
        return;
    }

    daftarProduk.innerHTML = data.map(item => `
        <div class="kartu-produk-toko">
            <img src="${escapeHTMLToko(item.gambar_url || "")}"
                 alt="${escapeHTMLToko(item.nama)}">

            <h3>${escapeHTMLToko(item.nama)}</h3>

            <p class="kategori-produk-toko">
                ${escapeHTMLToko(item.kategori || "Lainnya")}
            </p>

            <p class="harga-produk-toko">
                Rp${formatHargaToko(item.harga)}
            </p>

            <p>${escapeHTMLToko(item.deskripsi || "")}</p>

            <button type="button"
    class="tombol-detail-toko"
    data-detail-id="${escapeHTMLToko(item.id)}">
    Lihat Detail
</button>

            <button type="button"
                class="tombol-keranjang-toko"
                data-produk-id="${escapeHTMLToko(item.id)}">

                + Keranjang
            </button>
        </div>
    `).join("");

    // Aktifkan tombol keranjang
    // Aktifkan tombol detail produk
daftarProduk.querySelectorAll(".tombol-detail-toko")
    .forEach(tombol => {
        tombol.addEventListener("click", function () {
            bukaDetailProdukToko(this.dataset.detailId);
        });
    });
    daftarProduk.querySelectorAll(".tombol-keranjang-toko")
        .forEach(tombol => {
            tombol.addEventListener("click", function () {
                const idProduk = this.dataset.produkId;
                const item = produkTokoAktif.find(p => p.id === idProduk);

                if (!item) return;

                let keranjang = JSON.parse(
                    localStorage.getItem("keranjangPasar") || "[]"
                );

                const barangAda = keranjang.find(
                    p => p.produk_id === item.id
                );

                if (barangAda) {
                    barangAda.jumlah++;
                } else {
                    keranjang.push({
                        produk_id: item.id,
                        toko_id: item.toko_id,
                        nama: item.nama,
                        harga: Number(item.harga),
                        namaToko: toko.nama_toko,
                        jumlah: 1
                    });
                }

                localStorage.setItem(
                    "keranjangPasar",
                    JSON.stringify(keranjang) );
                    perbaruiJumlahKeranjangToko();
                alert("Produk berhasil ditambahkan ke keranjang!");
                
            });
        });
}


// Tampilkan semua produk pertama kali
tampilkanProdukToko(produk);


// PENCARIAN DAN FILTER KATEGORI
const inputCari = document.getElementById("cariProdukToko");
const filterKategori = document.getElementById("filterKategoriToko");

function filterProdukToko() {
    const kataKunci = inputCari.value.toLowerCase().trim();
    const kategoriDipilih = filterKategori.value;
    const urutan = document.getElementById("urutkanProdukToko").value;

    let hasilPencarian = produk.filter(item => {
        const namaCocok = String(item.nama || "")
            .toLowerCase()
            .includes(kataKunci);

        const kategoriCocok = kategoriDipilih === "" ||
            (item.kategori || "Lainnya") === kategoriDipilih;

        return namaCocok && kategoriCocok;
    });

    // URUTKAN PRODUK
    if (urutan === "termurah") {
        hasilPencarian.sort((a, b) => Number(a.harga) - Number(b.harga));
    } 
    else if (urutan === "termahal") {
        hasilPencarian.sort((a, b) => Number(b.harga) - Number(a.harga));
    } 
    else if (urutan === "nama") {
        hasilPencarian.sort((a, b) =>
            String(a.nama).localeCompare(String(b.nama), "id")
        );
    } 
    else {
        hasilPencarian.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );
    }

    tampilkanProdukToko(hasilPencarian);
}

// Jalankan saat pembeli mengetik
inputCari.addEventListener("input", filterProdukToko);

// Jalankan saat pembeli memilih kategori
filterKategori.addEventListener("change", filterProdukToko);

// Jalankan saat pembeli mengubah urutan
document.getElementById("urutkanProdukToko")
    .addEventListener("change", filterProdukToko);

    } catch (error) {
        console.error("Gagal memuat detail toko:", error);
        profil.innerHTML = "<p>Gagal memuat informasi toko.</p>";
        daftarProduk.innerHTML = "<p>Gagal memuat produk.</p>";
    }
}

// Amankan teks sebelum ditampilkan
function escapeHTMLToko(teks) {
    return String(teks ?? "").replace(/[&<>"']/g, karakter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[karakter]);
}


function bukaDetailProdukToko(idProduk) {
    const item = produkTokoAktif.find(p => p.id === idProduk);

    if (!item) {
        alert("Produk tidak ditemukan.");
        return;
    }

    const detailLama = document.getElementById("detailProdukToko");
    if (detailLama) detailLama.remove();

    const detail = document.createElement("div");
    detail.id = "detailProdukToko";

    detail.innerHTML = `
        <div class="isi-detail-toko">
            <button type="button" id="tutupDetailToko">✕</button>

            <img src="${escapeHTMLToko(item.gambar_url || "")}"
                 alt="${escapeHTMLToko(item.nama)}">

            <h2>${escapeHTMLToko(item.nama)}</h2>

            <h3>Rp${formatHargaToko(item.harga)}</h3>

            <p>Kategori: ${escapeHTMLToko(item.kategori || "Lainnya")}</p>

            <p>${escapeHTMLToko(item.deskripsi || "Belum ada deskripsi.")}</p>

            <button type="button" id="tambahKeranjangDetail">
                + Tambahkan ke Keranjang
            </button>
        </div>
    `;

    document.body.appendChild(detail);

    document.getElementById("tutupDetailToko").onclick = () => {
        detail.remove();
    };

    document.getElementById("tambahKeranjangDetail").onclick = () => {
        detail.remove();

        const tombolKeranjang = document.querySelector(
            `.tombol-keranjang-toko[data-produk-id="${item.id}"]`
        );

        if (tombolKeranjang) {
            tombolKeranjang.click();
        }
    };
}

// PERBARUI JUMLAH KERANJANG DI HALAMAN TOKO
function perbaruiJumlahKeranjangToko() {
    const keranjang = JSON.parse(
        localStorage.getItem("keranjangPasar") || "[]"
    );

    const jumlah = keranjang.reduce(
        (total, item) => total + Number(item.jumlah || 0),
        0
    );

    const tampilanJumlah = document.getElementById(
        "jumlahKeranjangToko"
    );

    if (tampilanJumlah) {
        tampilanJumlah.textContent = jumlah;
    }
}

// Perbarui saat halaman dibuka
perbaruiJumlahKeranjangToko();

// Perbarui jika isi keranjang berubah dari tab lain
window.addEventListener("storage", perbaruiJumlahKeranjangToko);


// Jalankan halaman
muatDetailToko();
