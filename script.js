
// ===================================
// PASAR NGANJUK ONLINE
// PRODUK, PENCARIAN, DAN KERANJANG
// ===================================

// PRODUK CONTOH
const produk = [
    {
        nama: "Sepatu Sneakers Pria",
        harga: 125000,
        lokasi: "Nganjuk Kota",
        gambar: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
    },
    {
        nama: "Jam Tangan Pria",
        harga: 85000,
        lokasi: "Kertosono",
        gambar: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
    },
    {
        nama: "Kaos Casual Premium",
        harga: 65000,
        lokasi: "Loceret",
        gambar: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"
    },
    {
        nama: "Roti Premium",
        harga: 25000,
        lokasi: "Prambon",
        gambar: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500"
    }
];

// ===================================
// PRODUK LAMA DARI LOCAL STORAGE
// ===================================

const produkDariPenjual = JSON.parse(
    localStorage.getItem("produkPenjual") || "[]"
);

const profilToko = JSON.parse(
    localStorage.getItem("profilToko") || "null"
);

produkDariPenjual.forEach(item => {
    produk.push({
        nama: item.nama,
        harga: Number(item.harga),
        lokasi: profilToko ? profilToko.lokasi : "Nganjuk",
        gambar: item.gambar || "",
        deskripsi: item.deskripsi || "",
        namaToko: profilToko ? profilToko.namaToko : "Toko Penjual"
    });
});

// ===================================
// FORMAT RUPIAH
// ===================================

function formatRupiah(harga) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(harga);
}

// ===================================
// KERANJANG
// ===================================

let keranjang = JSON.parse(
    localStorage.getItem("keranjangPasar") || "[]"
);

function simpanKeranjang() {
    localStorage.setItem(
        "keranjangPasar",
        JSON.stringify(keranjang)
    );
}

// ===================================
// TAMPILKAN PRODUK
// ===================================

function tampilkanProduk(data) {
    const tempatProduk = document.getElementById("products");

    if (!tempatProduk) return;

    if (data.length === 0) {
        tempatProduk.innerHTML = "<p>Produk tidak ditemukan.</p>";
        return;
    }

    tempatProduk.innerHTML = data.map(item => {
        const index = produk.indexOf(item);

        return `
            <div class="product">
                <div class="product-image">
                    <img
                        src="${item.gambar || ""}"
                        alt="${item.nama}"
                        onclick="bukaDetailProduk(${index})"
                        style="cursor:pointer"
                    >
                </div>

                <div class="product-info">
                    <h3>${item.nama}</h3>

                    <p class="price">
                        ${formatRupiah(item.harga)}
                    </p>

                    <p class="location">
                        📍 ${item.lokasi || "Nganjuk"}
                    </p>

                    ${
                        item.toko_id
                        ? `
                            <button
                                class="buy-button"
                                onclick="window.location.href='toko.html?id=${encodeURIComponent(item.toko_id)}'">
                                🏪 Kunjungi Toko
                            </button>
                        `
                        : ""
                    }

                    <button
                        class="buy-button"
                        onclick="bukaDetailProduk(${index})">
                        Lihat Detail
                    </button>

                    <button
                        class="buy-button"
                        onclick="tambahKeranjang(${index})">
                        + Tambah ke Keranjang
                    </button>
                </div>
            </div>
        `;
    }).join("");
}


// ===================================
// DETAIL PRODUK
// ===================================

const detailOverlay = document.createElement("div");
detailOverlay.id = "detailOverlay";

detailOverlay.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 10000;
    align-items: center;
    justify-content: center;
    padding: 15px;
`;

detailOverlay.innerHTML = `
    <div style="
        background: white;
        width: 100%;
        max-width: 450px;
        border-radius: 14px;
        padding: 20px;
        position: relative;
        max-height: 90vh;
        overflow-y: auto;
    ">
        <button
            onclick="tutupDetailProduk()"
            style="
                position:absolute;
                right:12px;
                top:12px;
                border:0;
                background:#eee;
                padding:8px 12px;
                border-radius:8px;
                cursor:pointer;
            ">
            ✕
        </button>

        <img
            id="detailGambar"
            style="
                width:100%;
                height:250px;
                object-fit:contain;
                border-radius:10px;
                margin-bottom:15px;
            "
        >

        <h2 id="detailNama"></h2>
        <h2 id="detailHarga" style="color:#0879d9"></h2>

        <p id="detailLokasi"></p>
        <p id="detailToko"></p>
        <p id="detailDeskripsi"></p>

        <button
            id="detailTambahKeranjang"
            class="buy-button"
            style="width:100%; margin-top:15px;">
            + Tambah ke Keranjang
        </button>
    </div>
`;

document.body.appendChild(detailOverlay);

function bukaDetailProduk(index) {
    const item = produk[index];

    if (!item) return;

    document.getElementById("detailGambar").src =
        item.gambar || "";

    document.getElementById("detailNama").textContent =
        item.nama;

    document.getElementById("detailHarga").textContent =
        formatRupiah(item.harga);

    document.getElementById("detailLokasi").textContent =
        "📍 " + (item.lokasi || "Nganjuk");

    document.getElementById("detailToko").textContent =
        "🏪 " + (item.namaToko || "Toko Pasar Nganjuk Online");

    document.getElementById("detailDeskripsi").textContent =
        item.deskripsi || "Belum ada deskripsi produk.";

    document.getElementById("detailTambahKeranjang").onclick =
        function() {
            tambahKeranjang(index);
            tutupDetailProduk();
        };

    detailOverlay.style.display = "flex";
}

function tutupDetailProduk() {
    detailOverlay.style.display = "none";
}

detailOverlay.addEventListener("click", function(event) {
    if (event.target === detailOverlay) {
        tutupDetailProduk();
    }
});

// ===================================
// TAMBAH PRODUK KE KERANJANG
// ===================================

function tambahKeranjang(index) {
    const item = produk[index];

    if (!item) return;

    const barangAda = keranjang.find(barang => {
        if (item.id) {
            return barang.produk_id === item.id;
        }

        return !barang.produk_id && barang.nama === item.nama;
    });

    if (barangAda) {
        barangAda.jumlah++;
    } else {
        keranjang.push({
            produk_id: item.id || null,
            toko_id: item.toko_id || null,
            nama: item.nama,
            harga: item.harga,
            namaToko: item.namaToko || "",
            jumlah: 1
        });
    }

    simpanKeranjang();
    perbaruiKeranjang();
    bukaKeranjang();
}

// ===================================
// UBAH JUMLAH BARANG
// ===================================

function ubahJumlah(index, perubahan) {
    keranjang[index].jumlah += perubahan;

    if (keranjang[index].jumlah <= 0) {
        keranjang.splice(index, 1);
    }

    simpanKeranjang();
    perbaruiKeranjang();
}

// ===================================
// HAPUS PRODUK
// ===================================

function hapusProduk(index) {
    keranjang.splice(index, 1);

    simpanKeranjang();
    perbaruiKeranjang();
}

// ===================================
// HITUNG TOTAL
// ===================================

function hitungJumlah() {
    return keranjang.reduce(
        (total, item) => total + item.jumlah,
        0
    );
}

function hitungTotal() {
    return keranjang.reduce(
        (total, item) => total + item.harga * item.jumlah,
        0
    );
}

// ===================================
// TOMBOL DAN PANEL KERANJANG
// ===================================

const cartSummary = document.createElement("button");
cartSummary.id = "cartSummary";
cartSummary.type = "button";
cartSummary.onclick = bukaKeranjang;

document.body.appendChild(cartSummary);

const cartOverlay = document.createElement("div");
cartOverlay.id = "cartOverlay";

cartOverlay.innerHTML = `
    <div class="cart-panel">
        <div class="cart-header">
            <h2>Keranjang Belanja</h2>
            <button type="button" onclick="tutupKeranjang()">✕</button>
        </div>

        <div id="cartItems"></div>

        <div class="cart-footer">
            <p>Total Belanja</p>
            <strong id="cartTotal">Rp0</strong>

            <button
                type="button"
                class="checkout-button"
                onclick="bukaCheckout()">
                Lanjut ke Checkout
            </button>
        </div>
    </div>
`;

document.body.appendChild(cartOverlay);

// ===================================
// TAMPILKAN ISI KERANJANG
// ===================================

function perbaruiKeranjang() {
    cartSummary.innerHTML = `
        🛒 Keranjang (${hitungJumlah()})
        <strong>${formatRupiah(hitungTotal())}</strong>
    `;

    const cartItems = document.getElementById("cartItems");

    if (keranjang.length === 0) {
        cartItems.innerHTML =
            "<p class='cart-empty'>Keranjang masih kosong.</p>";
    } else {
        cartItems.innerHTML = keranjang.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.nama}</strong>
                    <p>${formatRupiah(item.harga)}</p>
                </div>

                <div class="cart-controls">
                    <button onclick="ubahJumlah(${index}, -1)">−</button>
                    <span>${item.jumlah}</span>
                    <button onclick="ubahJumlah(${index}, 1)">+</button>
                    <button
                        class="remove-button"
                        onclick="hapusProduk(${index})">
                        Hapus
                    </button>
                </div>
            </div>
        `).join("");
    }

    document.getElementById("cartTotal").textContent =
        formatRupiah(hitungTotal());
}

function bukaKeranjang() {
    cartOverlay.classList.add("show");
    perbaruiKeranjang();
}

function tutupKeranjang() {
    cartOverlay.classList.remove("show");
}

cartOverlay.addEventListener("click", function(event) {
    if (event.target === cartOverlay) {
        tutupKeranjang();
    }
});

cartOverlay.addEventListener("click", function(event) {
    if (event.target === cartOverlay) {
        tutupKeranjang();
    }
});

// ===================================
// PENCARIAN PRODUK
// ===================================

const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("input", function() {
        const kataKunci = this.value.toLowerCase().trim();

        const hasil = produk.filter(item => {
            const nama = String(item.nama || "").toLowerCase();
            const lokasi = String(item.lokasi || "").toLowerCase();
            const toko = String(
                item.namaToko || item.nama_toko || ""
            ).toLowerCase();
            const kategori = String(
                item.kategori || ""
            ).toLowerCase();

            return (
                nama.includes(kataKunci) ||
                lokasi.includes(kataKunci) ||
                toko.includes(kataKunci) ||
                kategori.includes(kataKunci)
            );
        });

        tampilkanProduk(hasil);
    });
}


// ===================================
// FILTER KATEGORI PRODUK
// ===================================

const tombolKategori = document.querySelectorAll(".category-item");

tombolKategori.forEach(item => {
    item.addEventListener("click", function() {
        const kategoriDipilih = this.dataset.category;

        const hasil = produk.filter(item => {
            const kategori = String(item.kategori || "").toLowerCase();

            return kategori === kategoriDipilih.toLowerCase();
        });

        tampilkanProduk(hasil);

        // Kosongkan pencarian
        if (searchInput) {
            searchInput.value = "";
        }

        // Tandai kategori aktif
        tombolKategori.forEach(kategori => {
            kategori.classList.remove("active");
        });

        this.classList.add("active");

        // Arahkan ke daftar produk
        document.getElementById("products")?.scrollIntoView({
            behavior: "smooth"
        });
    });
});

// ===================================
// TOMBOL SEMUA PRODUK
// ===================================

const tombolSemuaProduk = document.getElementById("semuaProduk");

if (tombolSemuaProduk) {
    tombolSemuaProduk.addEventListener("click", function() {
        tampilkanProduk(produk);

        tombolKategori.forEach(item => {
            item.classList.remove("active");
        });

        if (searchInput) {
            searchInput.value = "";
        }

        document.getElementById("products")?.scrollIntoView({
            behavior: "smooth"
        });
    });
}


// ===================================
// URUTKAN PRODUK
// ===================================

const urutkanProduk = document.getElementById("urutkanProduk");

if (urutkanProduk) {
    urutkanProduk.addEventListener("change", function() {
        let hasil = [...produk];

        if (this.value === "terbaru") {
            hasil.sort((a, b) =>
                new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );
        }

        if (this.value === "termurah") {
            hasil.sort((a, b) => a.harga - b.harga);
        }

        if (this.value === "termahal") {
            hasil.sort((a, b) => b.harga - a.harga);
        }

        tampilkanProduk(hasil);
    });
}


// ===================================
// CHECKOUT PEMBELI - COD
// ===================================

const checkoutOverlay = document.createElement("div");
checkoutOverlay.id = "checkoutOverlay";

checkoutOverlay.innerHTML = `
    <div class="checkout-panel">
        <div class="cart-header">
            <h2>Data Pemesanan</h2>
            <button type="button" onclick="tutupCheckout()">✕</button>
        </div>

        <form id="checkoutForm">
            <label>Nama lengkap</label>
            <input
                name="nama"
                type="text"
                placeholder="Masukkan nama lengkap"
                required
            >

            <label>Nomor WhatsApp</label>
            <input
                name="whatsapp"
                type="tel"
                placeholder="Contoh: 081234567890"
                required
            >

            <label>Alamat lengkap</label>
            <textarea
                name="alamat"
                placeholder="Nama jalan, RT/RW, desa atau kelurahan"
                required
            ></textarea>

            <label>Kecamatan</label>
            <input
                name="kecamatan"
                type="text"
                placeholder="Contoh: Nganjuk"
                required
            >

            <label>Catatan pesanan (opsional)</label>
            <textarea
                name="catatan"
                placeholder="Catatan tambahan untuk penjual"
            ></textarea>

            <div style="
                background:#f0f7ff;
                padding:12px;
                border-radius:8px;
                margin:15px 0;
            ">
                <strong>Metode Pembayaran</strong>
                <p>COD - Bayar saat barang diterima.</p>
            </div>

            <div class="checkout-total">
                <span>Total belanja</span>
                <strong id="checkoutTotal">Rp0</strong>
            </div>

            <button class="checkout-button" type="submit">
                Buat Pesanan COD
            </button>
        </form>

        <p id="checkoutMessage"></p>
    </div>
`;

document.body.appendChild(checkoutOverlay);

// ===================================
// BUKA CHECKOUT
// ===================================

function bukaCheckout() {
    if (keranjang.length === 0) {
        alert("Keranjang masih kosong. Silakan pilih produk dahulu.");
        return;
    }

    document.getElementById("checkoutTotal").textContent =
        formatRupiah(hitungTotal());

    document.getElementById("checkoutMessage").textContent = "";
    document.getElementById("checkoutForm").reset();

    checkoutOverlay.classList.add("show");
}

function tutupCheckout() {
    checkoutOverlay.classList.remove("show");
}

// ===================================
// SIMPAN PESANAN KE SUPABASE
// ===================================

document.getElementById("checkoutForm").addEventListener(
    "submit",
    async function(event) {
        event.preventDefault();

        const tombol = this.querySelector("button[type='submit']");
        const pesan = document.getElementById("checkoutMessage");

        if (keranjang.length === 0) {
            pesan.textContent = "Keranjang masih kosong.";
            return;
        }

        // Pastikan semua produk berasal dari Supabase
        const produkTidakValid = keranjang.some(item =>
            !item.produk_id || !item.toko_id
        );

        if (produkTidakValid) {
            pesan.textContent =
                "Ada produk contoh atau produk lama di keranjang. Hapus produk tersebut, lalu pilih produk dari toko yang sudah tersimpan online.";

            return;
        }

        if (typeof supabaseClient === "undefined") {
            pesan.textContent = "Koneksi database belum tersedia.";
            return;
        }

        tombol.disabled = true;
        tombol.textContent = "Menyimpan pesanan...";

        try {
            const dataPembeli = Object.fromEntries(
                new FormData(this).entries()
            );

            // Buat ID pesanan dari browser
            const idPesanan = crypto.randomUUID();

            const kodePesanan =
                "PNO-" + Date.now();

            const totalPesanan = hitungTotal();

            // SIMPAN DATA UTAMA PESANAN
            const { error: errorPesanan } =
                await supabaseClient
                    .from("pesanan")
                    .insert({
                        id: idPesanan,
                        kode_pesanan: kodePesanan,
                        nama_pembeli: dataPembeli.nama,
                        whatsapp: dataPembeli.whatsapp,
                        alamat: dataPembeli.alamat,
                        kecamatan: dataPembeli.kecamatan,
                        catatan: dataPembeli.catatan || "",
                        metode_pembayaran: "COD",
                        total: totalPesanan,
                        status: "Menunggu"
                    });

            if (errorPesanan) {
                throw errorPesanan;
            }

            // SIAPKAN DETAIL BARANG PESANAN
            const daftarItem = keranjang.map(item => ({
                pesanan_id: idPesanan,
                produk_id: item.produk_id,
                toko_id: item.toko_id,
                nama_produk: item.nama,
                harga: item.harga,
                jumlah: item.jumlah,
                nama_toko: item.namaToko || ""
            }));

            // SIMPAN DETAIL BARANG
            const { error: errorItem } =
                await supabaseClient
                    .from("item_pesanan")
                    .insert(daftarItem);

            if (errorItem) {
                throw errorItem;
            }

            // SIMPAN SALINAN LOKAL
            const pesananLokal = {
                kode_pesanan: kodePesanan,
                tanggal: new Date().toISOString(),
                pembeli: dataPembeli,
                produk: keranjang.map(item => ({ ...item })),
                total: totalPesanan,
                metode_pembayaran: "COD",
                status: "Menunggu"
            };

            const daftarPesanan = JSON.parse(
                localStorage.getItem("pesananPasar") || "[]"
            );

            daftarPesanan.push(pesananLokal);

            localStorage.setItem(
                "pesananPasar",
                JSON.stringify(daftarPesanan)
            );

            // KOSONGKAN KERANJANG
            keranjang = [];
            simpanKeranjang();
            perbaruiKeranjang();

            pesan.textContent =
                "Pesanan berhasil dibuat! Kode pesanan: " + kodePesanan +
                ". Pembayaran dilakukan saat barang diterima.";

            this.reset();

            tombol.textContent = "Pesanan Berhasil";

        } catch (error) {
            console.error("Gagal membuat pesanan:", error);

            pesan.textContent =
                "Pesanan gagal disimpan: " + error.message;

            tombol.disabled = false;
            tombol.textContent = "Buat Pesanan COD";
        }
    }
);

// ===================================
// AMBIL PRODUK DARI SUPABASE
// ===================================

async function ambilProdukSupabase() {
    try {
        const { data, error } = await supabaseClient
    .from("produk")
.select("*")
.eq("status", "aktif")
.eq("status_admin", "aktif")
.order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            data.forEach(item => {
                const sudahAda = produk.some(p =>
                    p.id === item.id
                );

                if (!sudahAda) {
                    produk.push({
                        id: item.id,
                        toko_id: item.toko_id,
                        nama: item.nama,
                        harga: Number(item.harga),
                        deskripsi: item.deskripsi || "",
                        lokasi: item.lokasi,
                        gambar: item.gambar_url || "",
                        namaToko: item.nama_toko,
kategori: item.kategori || "Lainnya",
created_at: item.created_at
                    });
                }
            });

            tampilkanProduk(produk);
        }

        console.log(
            "Produk Supabase berhasil dimuat:",
            data
        );

    } catch (error) {
        console.error(
            "Gagal mengambil produk Supabase:",
            error.message
        );
    }
}

// ===================================
// AMBIL TOKO AKTIF DARI SUPABASE
// ===================================

async function ambilTokoAktif() {
    const areaToko = document.getElementById("popularStores");

    if (!areaToko) return;

    try {
        const { data, error } = await supabaseClient
            .from("toko")
            .select("id, nama_toko, deskripsi, status")
            .eq("status", "aktif")
            .order("created_at", { ascending: false });

        if (error) throw error;

        areaToko.innerHTML = "";

        if (!data || data.length === 0) {
            areaToko.textContent = "Belum ada toko aktif.";
            return;
        }

        data.forEach(item => {
            const kartu = document.createElement("div");
            kartu.textContent = "🏪 " + item.nama_toko;
            areaToko.appendChild(kartu);
        });

    } catch (error) {
        console.error("Gagal mengambil toko:", error.message);
        areaToko.textContent = "Gagal memuat toko.";
    }
}

// ===================================
// JALANKAN SAAT WEBSITE DIBUKA
// ===================================

tampilkanProduk(produk);
perbaruiKeranjang();


if (typeof supabaseClient !== "undefined") {
    ambilProdukSupabase();
    ambilTokoAktif();
}

