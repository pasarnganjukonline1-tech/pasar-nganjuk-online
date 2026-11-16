

// =====================================
// KERANJANG PASAR NGANJUK ONLINE
// =====================================

let keranjang = JSON.parse(
    localStorage.getItem("keranjangPasar") || "[]"
);

// Menampilkan isi keranjang

// =====================================
// HITUNG TOTAL KERANJANG
// =====================================

function hitungTotalKeranjang() {
    return keranjang.reduce((total, item) => {
        return total + (
            Number(item.harga) * Number(item.jumlah)
        );
    }, 0);
}


// =====================================
// TAMPILKAN ISI KERANJANG
// =====================================

function tampilkanKeranjang() {
    const daftar = document.getElementById("daftarKeranjang");

    

    if (!keranjang.length) {
        daftar.innerHTML = "<p>Keranjang masih kosong.</p>";
        return;
    }

    daftar.innerHTML = keranjang.map((item, index) => `
        <div class="item-keranjang">
            <h3>${item.nama}</h3>
            <p>${item.namaToko || "Toko"}</p>
            <p>Rp${Number(item.harga).toLocaleString("id-ID")}</p>

            <div class="kontrol-jumlah">
                <button onclick="ubahJumlah(${index}, -1)">−</button>
                <span>${item.jumlah}</span>
                <button onclick="ubahJumlah(${index}, 1)">+</button>
            </div>

            <button onclick="hapusProduk(${index})">
                Hapus
            </button>
        </div>
    `).join("");

    const total = keranjang.reduce((jumlah, item) => {
        return jumlah + (Number(item.harga) * Number(item.jumlah));
    }, 0);

    daftar.innerHTML += `
        <div class="total-keranjang">
            <h3>Total Belanja</h3>
            <h2>Rp${total.toLocaleString("id-ID")}</h2>
        </div>
    `;
}


// Jalankan saat halaman dibuka
tampilkanKeranjang();


// =====================================
// UBAH JUMLAH PRODUK
// =====================================

function ubahJumlah(index, perubahan) {
    keranjang[index].jumlah += perubahan;

    if (keranjang[index].jumlah <= 0) {
        keranjang.splice(index, 1);
    }

    simpanKeranjang();
    tampilkanKeranjang();
}

// =====================================
// HAPUS PRODUK
// =====================================

function hapusProduk(index) {
    keranjang.splice(index, 1);

    simpanKeranjang();
    tampilkanKeranjang();
}

// =====================================
// SIMPAN KERANJANG
// =====================================

function simpanKeranjang() {
    localStorage.setItem(
        "keranjangPasar",
        JSON.stringify(keranjang)
    );
}


// =====================================
// CHECKOUT COD DARI HALAMAN KERANJANG
// =====================================

const formCheckout = document.getElementById("checkoutForm");

if (formCheckout) {
    formCheckout.addEventListener("submit", async function(event) {
        event.preventDefault();

        const tombol = document.getElementById("tombolCheckout");
        const pesan = document.getElementById("checkoutMessage");

        if (keranjang.length === 0) {
            pesan.textContent = "Keranjang masih kosong.";
            return;
        }

        const produkTidakValid = keranjang.some(item =>
            !item.produk_id || !item.toko_id
        );

        if (produkTidakValid) {
            pesan.textContent = "Ada produk yang tidak valid. Silakan periksa keranjang.";
            return;
        }

        tombol.disabled = true;
        tombol.textContent = "Menyimpan pesanan...";

        try {
            const dataPembeli = Object.fromEntries(
                new FormData(formCheckout).entries()
            );
         const daftarItem = keranjang.map(item => ({
    produk_id: item.produk_id,
    toko_id: item.toko_id,
    jumlah: item.jumlah
}));

const { data: hasilPesanan, error: errorPesanan } =
    await supabaseClient.rpc("buat_pesanan_cod", {
        p_nama_pembeli: dataPembeli.nama,
        p_whatsapp: dataPembeli.whatsapp,
        p_alamat: dataPembeli.alamat,
        p_kecamatan: dataPembeli.kecamatan,
        p_catatan: dataPembeli.catatan || "",
        p_items: daftarItem
    });

if (errorPesanan) throw errorPesanan;

const kodePesanan = hasilPesanan.kode_pesanan;
            pesan.textContent =
                "Pesanan berhasil dibuat! Kode pesanan: " + kodePesanan;

            keranjang = [];
            simpanKeranjang();
            tampilkanKeranjang();
            formCheckout.reset();

            tombol.textContent = "Pesanan Berhasil";

        } catch (error) {
            console.error("Gagal membuat pesanan:", error);
            pesan.textContent = "Pesanan gagal: " + error.message;

            tombol.disabled = false;
            tombol.textContent = "Buat Pesanan COD";
        }
    });
}
