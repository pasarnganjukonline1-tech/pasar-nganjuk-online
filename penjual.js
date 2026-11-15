
// =====================================
// 1. MENYIMPAN PROFIL TOKO KE SUPABASE
// =====================================

async function simpanToko() {
    const toko = {
    nama: document.getElementById("namaToko").value.trim(),
    pemilik: document.getElementById("pemilikToko").value.trim(),
    lokasi: document.getElementById("lokasiToko").value.trim(),
    whatsapp: document.getElementById("whatsappToko").value.trim(),
    deskripsi: document.getElementById("deskripsiToko").value.trim()
};
    const nama = toko.nama;
    const pemilik = document.getElementById("pemilikToko").value.trim();
    const lokasi = document.getElementById("lokasiToko").value.trim();

    const fileProfil = document.getElementById("fotoProfilToko").files[0];
    const fileBanner = document.getElementById("bannerToko").files[0];

    const pesan = document.getElementById("pesanToko");

    if (!nama || !pemilik || !lokasi) {
        pesan.textContent = "Lengkapi semua informasi toko.";
        return;
    }

    // Periksa ukuran dan tipe gambar
    for (const file of [fileProfil, fileBanner]) {
        if (!file) continue;

        if (!file.type.startsWith("image/")) {
            pesan.textContent = "File harus berupa gambar.";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            pesan.textContent = "Ukuran gambar maksimal 2 MB.";
            return;
        }
    }

    try {
        pesan.textContent = "Menyimpan profil toko...";

        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError || !sessionData.session) {
            pesan.textContent = "Silakan login terlebih dahulu.";
            window.location.href = "login-penjual.html";
            return;
        }

        const userId = sessionData.session.user.id;

        // Ambil data toko lama agar gambar tidak hilang
        const { data: tokoLama, error: tokoError } =
            await supabaseClient
                .from("toko")
                .select("foto_toko_url, banner_toko_url")
                .eq("user_id", userId)
                .maybeSingle();

        if (tokoError) throw tokoError;

        let fotoURL = tokoLama?.foto_toko_url || null;
        let bannerURL = tokoLama?.banner_toko_url || null;

        // Fungsi upload gambar ke Supabase Storage
        async function uploadGambarToko(file, jenis) {
            if (!file) return null;

            const ekstensi = {
                "image/jpeg": "jpg",
                "image/png": "png",
                "image/webp": "webp",
                "image/gif": "gif"
            }[file.type];

            if (!ekstensi) {
                throw new Error("Gunakan gambar JPG, PNG, WEBP, atau GIF.");
            }

            const namaFile =
                `${userId}/${jenis}-${Date.now()}.${ekstensi}`;

            const { error: uploadError } = await supabaseClient
                .storage
                .from("foto-produk")
                .upload(namaFile, file, {
                    contentType: file.type,
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data } = supabaseClient
                .storage
                .from("foto-produk")
                .getPublicUrl(namaFile);

            return data.publicUrl;
        }

        // Upload foto profil jika dipilih
        if (fileProfil) {
            pesan.textContent = "Mengunggah foto profil...";
            fotoURL = await uploadGambarToko(fileProfil, "profil");
        }

        // Upload banner jika dipilih
        if (fileBanner) {
            pesan.textContent = "Mengunggah banner toko...";
            bannerURL = await uploadGambarToko(fileBanner, "banner");
        }
console.log("FOTO:", JSON.stringify(fotoURL));
console.log("PANJANG URL FOTO:", fotoURL?.length);

console.log("BANNER:", JSON.stringify(bannerURL));
console.log("PANJANG URL BANNER:", bannerURL?.length);

console.log("JUMLAH URL FOTO:", (fotoURL.match(/https:\/\//g) || []).length);
console.log("JUMLAH URL BANNER:", (bannerURL.match(/https:\/\//g) || []).length);


// Simpan profil dan alamat gambar
const profil = {
    user_id: userId,
    nama_toko: nama,
    nama_pemilik: pemilik,
    lokasi: lokasi,
    whatsapp: toko.whatsapp,
    foto_toko_url: fotoURL,
    banner_toko_url: bannerURL,
    deskripsi: toko.deskripsi
};
        const { error } = await supabaseClient
            .from("toko")
            .upsert(profil, { onConflict: "user_id" });

        if (error) throw error;

        pesan.textContent = "Profil, foto, dan banner toko berhasil disimpan!";

    } catch (error) {
        console.error("Gagal menyimpan profil toko:", error);
        pesan.textContent = "Gagal menyimpan: " + error.message;
    }
}


// =====================================
// 2. MEMUAT PROFIL TOKO
// =====================================

async function muatProfilToko() {
    const pesan = document.getElementById("pesanToko");

    try {
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError || !sessionData.session) {
            window.location.href = "login-penjual.html";
            return;
        }

        const userId = sessionData.session.user.id;

        const { data, error } = await supabaseClient
            .from("toko")
            .select("nama_toko, nama_pemilik, lokasi")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;

        if (data) {
            document.getElementById("namaToko").value =
                data.nama_toko || "";

            document.getElementById("pemilikToko").value =
                data.nama_pemilik || "";

            document.getElementById("lokasiToko").value =
                data.lokasi || "";

            pesan.textContent = "Profil toko berhasil dimuat.";
        } else {
            pesan.textContent = "Silakan lengkapi profil toko.";
        }

    } catch (error) {
        console.error("Gagal memuat profil toko:", error);
        pesan.textContent = "Gagal memuat profil toko: " + error.message;
    }
}


// =====================================
// 3. DATA PRODUK PENJUAL
// =====================================

let produkPenjual = [];


// =====================================
// 4. PENGAMAN TAMPILAN TEKS
// =====================================

function escapeHTMLPenjual(teks) {
    return String(teks ?? "").replace(/[&<>"']/g, karakter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[karakter]);
}


// =====================================
// 5. MENAMBAHKAN PRODUK
// =====================================

async function tambahProdukPenjual() {
    const nama = document.getElementById("namaProduk").value.trim();
    const harga = Number(document.getElementById("hargaProduk").value);
    const deskripsi = document.getElementById("deskripsiProduk").value.trim();
    const file = document.getElementById("fotoProduk").files[0];
    const pesan = document.getElementById("pesanProduk");

    if (!nama || !Number.isFinite(harga) || harga <= 0 || !file) {
        pesan.textContent = "Lengkapi nama, harga, dan foto produk.";
        return;
    }

    if (!file.type.startsWith("image/")) {
        pesan.textContent = "File harus berupa gambar.";
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        pesan.textContent = "Ukuran foto maksimal 2 MB.";
        return;
    }

    pesan.textContent = "Sedang mengunggah produk...";

    let pathFoto = null;

    try {
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError || !sessionData.session) {
            window.location.href = "login-penjual.html";
            return;
        }

        const userId = sessionData.session.user.id;

        const { data: toko, error: tokoError } = await supabaseClient
            .from("toko")
            .select("id, nama_toko, lokasi")
            .eq("user_id", userId)
            .single();

        if (tokoError || !toko) {
            throw new Error(
                "Profil toko belum ditemukan. Simpan profil toko terlebih dahulu."
            );
        }

        const namaFile = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        pathFoto = `${userId}/${Date.now()}-${namaFile}`;

        const { error: uploadError } = await supabaseClient
            .storage
            .from("foto-produk")
            .upload(pathFoto, file, {
                cacheControl: "3600",
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseClient
            .storage
            .from("foto-produk")
            .getPublicUrl(pathFoto);

        const gambarUrl = urlData.publicUrl;

        const { data: produkBaru, error: produkError } =
            await supabaseClient
                .from("produk")
                .insert({
                    nama: nama,
                    harga: harga,
                    deskripsi: deskripsi,
kategori: document.getElementById("kategoriProduk").value,
lokasi: toko.lokasi,
                    gambar_url: gambarUrl,
                    toko_id: toko.id
                })
                .select()
                .single();

        if (produkError) throw produkError;

        produkPenjual.unshift({
            id: produkBaru.id,
            nama: produkBaru.nama,
            harga: Number(produkBaru.harga),
            deskripsi: produkBaru.deskripsi,
            kategori: produkBaru.kategori,
            gambar: produkBaru.gambar_url,
            pathFoto: pathFoto

        });

        document.getElementById("namaProduk").value = "";
        document.getElementById("hargaProduk").value = "";
        document.getElementById("deskripsiProduk").value = "";
        document.getElementById("fotoProduk").value = "";

        pesan.textContent = "Produk berhasil disimpan secara online!";

        tampilkanProdukPenjual();

    } catch (error) {
        console.error("Gagal menambahkan produk:", error);

        if (pathFoto) {
            const { error: hapusFotoError } = await supabaseClient
                .storage
                .from("foto-produk")
                .remove([pathFoto]);

            if (hapusFotoError) {
                console.error("Gagal membersihkan foto:", hapusFotoError);
            }
        }

        pesan.textContent = "Gagal menyimpan produk: " + error.message;
    }
}


// =====================================
// 6. MENAMPILKAN PRODUK PENJUAL
// =====================================

function tampilkanProdukPenjual() {
    const tempat = document.getElementById("daftarProdukPenjual");

    if (produkPenjual.length === 0) {
        tempat.innerHTML = "<p>Belum ada produk.</p>";
        return;
    }

    tempat.innerHTML = produkPenjual.map((item, index) => `
        <div class="seller-product">
            <img
                src="${escapeHTMLPenjual(item.gambar)}"
                alt="${escapeHTMLPenjual(item.nama)}"
            >

            <div>
                <strong>${escapeHTMLPenjual(item.nama)}</strong>

                <p>
                    Rp${item.harga.toLocaleString("id-ID")}
                </p>

                <button onclick="hapusProdukPenjual(${index})">
                    Hapus
                </button>
            </div>
        </div>
    `).join("");
}


// =====================================
// 7. MEMUAT PRODUK DARI SUPABASE
// =====================================

async function muatProdukPenjual() {
    const tempat = document.getElementById("daftarProdukPenjual");

    tempat.innerHTML = "<p>Memuat produk...</p>";

    try {
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError || !sessionData.session) {
            window.location.href = "login-penjual.html";
            return;
        }

        const userId = sessionData.session.user.id;

        const { data: toko, error: tokoError } = await supabaseClient
            .from("toko")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

        if (tokoError) throw tokoError;

        if (!toko) {
            produkPenjual = [];
            tempat.innerHTML = "<p>Profil toko belum ditemukan.</p>";
            return;
        }

        const { data, error } = await supabaseClient
            .from("produk")
            .select("*")
            .eq("toko_id", toko.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        produkPenjual = data.map(item => {
            const penanda = "/storage/v1/object/public/foto-produk/";
            const posisi = (item.gambar_url || "").lastIndexOf(penanda);

            let pathFoto = null;

            if (posisi !== -1) {
                pathFoto = decodeURIComponent(
                    item.gambar_url.substring(posisi + penanda.length)
                );
            }

            return {
                id: item.id,
                nama: item.nama,
                harga: Number(item.harga),
                deskripsi: item.deskripsi || "",
                gambar: item.gambar_url,
                pathFoto: pathFoto
            };
        });

        tampilkanProdukPenjual();

    } catch (error) {
        console.error("Gagal memuat produk:", error);

        tempat.innerHTML =
            "<p>Gagal memuat produk: " +
            escapeHTMLPenjual(error.message) +
            "</p>";
    }
}


// =====================================
// 8. MENGHAPUS PRODUK DAN FOTO
// =====================================

async function hapusProdukPenjual(index) {
    if (!confirm("Hapus produk ini?")) return;

    const item = produkPenjual[index];

    if (!item || !item.id) {
        alert("ID produk tidak ditemukan.");
        return;
    }

    try {
        const { error } = await supabaseClient
            .from("produk")
            .delete()
            .eq("id", item.id);

        if (error) throw error;

        if (item.pathFoto) {
            const { error: fotoError } = await supabaseClient
                .storage
                .from("foto-produk")
                .remove([item.pathFoto]);

            if (fotoError) {
                console.error("Foto gagal dihapus:", fotoError);
            }
        }

        produkPenjual.splice(index, 1);

        tampilkanProdukPenjual();

        alert("Produk berhasil dihapus.");

    } catch (error) {
        console.error("Gagal menghapus produk:", error);
        alert("Gagal menghapus produk: " + error.message);
    }
}


// =====================================
// 9. MEMUAT PESANAN MASUK
// =====================================


async function muatPesananPenjual() {
    const tempat = document.getElementById("daftarPesananPenjual");
    const pesan = document.getElementById("pesanPesanan");

    tempat.innerHTML = "<p>Memuat pesanan...</p>";
    pesan.textContent = "";

    try {
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError || !sessionData.session) {
            window.location.href = "login-penjual.html";
            return;
        }

        const userId = sessionData.session.user.id;

        const { data: toko, error: tokoError } = await supabaseClient
            .from("toko")
            .select("id")
            .eq("user_id", userId)
            .single();

        if (tokoError || !toko) {
            tempat.innerHTML = "<p>Profil toko belum ditemukan.</p>";
            return;
        }

        const { data: daftarItem, error: itemError } =
            await supabaseClient
                .from("item_pesanan")
                .select("*")
                .eq("toko_id", toko.id);

        if (itemError) throw itemError;

        if (!daftarItem || daftarItem.length === 0) {
            tempat.innerHTML = "<p>Belum ada pesanan masuk.</p>";
            return;
        }

        const idPesanan = [
            ...new Set(daftarItem.map(item => item.pesanan_id))
        ];

        const { data: daftarPesanan, error: pesananError } =
            await supabaseClient
                .from("pesanan")
                .select("*")
                .in("id", idPesanan)
                .order("created_at", { ascending: false });

        if (pesananError) throw pesananError;

        tempat.innerHTML = daftarPesanan.map(pesanan => {
            const itemToko = daftarItem.filter(
                item => item.pesanan_id === pesanan.id
            );

            const subtotalToko = itemToko.reduce(
                (total, item) =>
                    total + Number(item.harga) * Number(item.jumlah),
                0
            );

            const tanggal = pesanan.created_at
                ? new Date(pesanan.created_at).toLocaleString("id-ID")
                : "-";

            return `
                <div class="order-card">
                    <h3>Pesanan ${escapeHTMLPenjual(pesanan.kode_pesanan)}</h3>

                    <p><strong>Tanggal:</strong>
                    ${escapeHTMLPenjual(tanggal)}</p>

                    <hr>

                    <h4>Data Pembeli</h4>

                    <p><strong>Nama:</strong>
                    ${escapeHTMLPenjual(pesanan.nama_pembeli)}</p>

<p><strong>WhatsApp:</strong>
${escapeHTMLPenjual(pesanan.whatsapp)}</p>

<a
    href="https://wa.me/${String(pesanan.whatsapp).replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(
        `Halo ${pesanan.nama_pembeli}, kami dari toko ${itemToko[0]?.nama_toko || "kami"}. Pesanan Anda dengan kode ${pesanan.kode_pesanan} sudah kami terima. Terima kasih telah berbelanja!`
    )}"
    target="_blank"
    rel="noopener noreferrer"
    style="
        display:inline-block;
        background:#25D366;
        color:white;
        padding:10px 15px;
        border-radius:8px;
        text-decoration:none;
        font-weight:bold;
        margin:8px 0;
    "
>
    Chat Pembeli via WhatsApp
</a>

                    

                    <p><strong>Alamat:</strong>
                    ${escapeHTMLPenjual(pesanan.alamat)}</p>

                    <p><strong>Kecamatan:</strong>
                    ${escapeHTMLPenjual(pesanan.kecamatan)}</p>

                    <p><strong>Catatan:</strong>
                    ${escapeHTMLPenjual(pesanan.catatan || "-")}</p>

                    <hr>

                    <h4>Produk yang Dipesan</h4>

                    ${itemToko.map(item => `
                        <div class="order-product">
                            <strong>${escapeHTMLPenjual(item.nama_produk)}</strong>

                            <p>
                                ${Number(item.jumlah)} ×
                                Rp${Number(item.harga).toLocaleString("id-ID")}
                            </p>

                            <strong>
                                Rp${(
                                    Number(item.harga) *
                                    Number(item.jumlah)
                                ).toLocaleString("id-ID")}
                            </strong>

                            <p><strong>Status produk:</strong></p>

                            <select
                                class="status-pesanan"
                                onchange="ubahStatusPesanan('${item.id}', this.value)"
                            >
                                ${[
                                    "Menunggu",
                                    "Diproses",
                                    "Siap dikirim",
                                    "Selesai",
                                    "Dibatalkan"
                                ].map(status => `
                                    <option
                                        value="${status}"
                                        ${(
                                            (item.status_toko || "Menunggu") === status
                                        ) ? "selected" : ""}
                                    >
                                        ${status}
                                    </option>
                                `).join("")}
                            </select>
                        </div>
                        <hr>
                    `).join("")}

                    <p><strong>Pembayaran:</strong>
                    ${escapeHTMLPenjual(pesanan.metode_pembayaran)}</p>

                    <p><strong>Total seluruh pesanan:</strong>
                    Rp${Number(pesanan.total).toLocaleString("id-ID")}</p>

                    <p class="order-total">
                        Subtotal produk toko ini:
                        Rp${subtotalToko.toLocaleString("id-ID")}
                    </p>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Gagal memuat pesanan:", error);
        tempat.innerHTML =
            "<p>Gagal memuat pesanan: " +
            escapeHTMLPenjual(error.message) +
            "</p>";
    }
}


// =====================================
// UBAH STATUS PESANAN
// =====================================

async function ubahStatusPesanan(idItem, statusBaru) {
    const statusDiizinkan = [
        "Menunggu",
        "Diproses",
        "Siap dikirim",
        "Selesai",
        "Dibatalkan"
    ];

    if (!statusDiizinkan.includes(statusBaru)) {
        alert("Status tidak valid.");
        return;
    }

    try {
        const { error } = await supabaseClient
            .from("item_pesanan")
            .update({ status_toko: statusBaru })
            .eq("id", idItem);

        if (error) throw error;

        document.getElementById("pesanPesanan").textContent =
            "Status pesanan berhasil diubah menjadi " + statusBaru;

    } catch (error) {
        console.error("Gagal mengubah status:", error);

        alert("Gagal mengubah status: " + error.message);

        muatPesananPenjual();
    }
}


// =====================================
// 10. JALANKAN SAAT DASHBOARD DIBUKA
// =====================================

// =====================================
// NOTIFIKASI PESANAN BARU
// =====================================

let jumlahPesananSebelumnya = null;

async function pantauPesananBaru() {
    try {
        const { data: sessionData } =
            await supabaseClient.auth.getSession();

        if (!sessionData.session) return;

        const userId = sessionData.session.user.id;

        const { data: toko, error: tokoError } =
            await supabaseClient
                .from("toko")
                .select("id")
                .eq("user_id", userId)
                .single();

        if (tokoError || !toko) return;

        const { data: daftarItem, error } =
            await supabaseClient
                .from("item_pesanan")
                .select("id, pesanan_id")
                .eq("toko_id", toko.id);

        if (error) throw error;

        const jumlahSekarang = daftarItem.length;

        if (jumlahPesananSebelumnya !== null &&
            jumlahSekarang > jumlahPesananSebelumnya) {

            const jumlahBaru =
                jumlahSekarang - jumlahPesananSebelumnya;

            const notifikasi =
                document.getElementById("notifikasiPesanan");

            notifikasi.innerHTML = `
                <div style="
                    background:#e8f5e9;
                    color:#176b2c;
                    padding:12px;
                    margin:10px 0;
                    border-radius:8px;
                    font-weight:bold;
                ">
                    🔔 Ada ${jumlahBaru} pesanan baru masuk!
                </div>
            `;

            muatPesananPenjual();
        }

        jumlahPesananSebelumnya = jumlahSekarang;

    } catch (error) {
        console.error("Gagal memantau pesanan:", error);
    }
}

muatProfilToko();
muatProdukPenjual();
muatPesananPenjual();

// Periksa pesanan baru setiap 10 detik
pantauPesananBaru();

setInterval(() => {
    pantauPesananBaru();
}, 10000);