
// =====================================
// CEK RIWAYAT PESANAN PEMBELI
// =====================================

const formCekPesanan = document.getElementById("formCekPesanan");

formCekPesanan.addEventListener("submit", async function(event) {
    event.preventDefault();

    const kode = document.getElementById("kodePesanan").value.trim();
    const whatsapp = document.getElementById("whatsappPesanan").value.trim();

    const tombol = document.getElementById("tombolCekPesanan");
    const pesan = document.getElementById("pesanCekPesanan");
    const hasil = document.getElementById("hasilPesanan");

    tombol.disabled = true;
    tombol.textContent = "Mencari pesanan...";
    pesan.textContent = "";
    hasil.innerHTML = "";

    try {
        // PANGGIL FUNGSI AMAN DI SUPABASE
        const { data, error } = await supabaseClient.rpc(
            "cek_pesanan_pembeli",
            {
                p_kode: kode,
                p_whatsapp: whatsapp
            }
        );

        if (error) throw error;

        if (!data || !data.pesanan) {
            pesan.textContent =
                "Pesanan tidak ditemukan. Periksa kode dan nomor WhatsApp.";
            return;
        }

        const pesanan = data.pesanan;
        const daftarItem = data.items || [];

        const formatRupiah = angka =>
            Number(angka).toLocaleString("id-ID");

        hasil.innerHTML = `
            <div class="checkout-keranjang">

                <h2>Detail Pesanan</h2>

                <p><strong>Kode Pesanan:</strong>
                    ${escapeHTMLRiwayat(pesanan.kode_pesanan)}
                </p>

                <p><strong>Nama Pembeli:</strong>
                    ${escapeHTMLRiwayat(pesanan.nama_pembeli)}
                </p>

                <p><strong>Status Pesanan:</strong>
                    <strong>${escapeHTMLRiwayat(pesanan.status)}</strong>
                </p>

                <h3>Produk yang Dipesan</h3>

                ${daftarItem.map(item => `
                    <div class="item-keranjang">
                        <h3>${escapeHTMLRiwayat(item.nama_produk)}</h3>
                        <p>${escapeHTMLRiwayat(item.nama_toko || "Toko")}</p>
                        <p>Harga: Rp${formatRupiah(item.harga)}</p>
                        <p>Jumlah: ${Number(item.jumlah)}</p>
                        <p>Subtotal: Rp${formatRupiah(Number(item.harga) * Number(item.jumlah))}</p>
                    </div>
                `).join("")}

                <div class="total-keranjang">
                    <h3>Total Pembayaran</h3>
                    <h2>Rp${formatRupiah(pesanan.total)}</h2>
                </div>

                <p><strong>Pembayaran:</strong>
                    ${escapeHTMLRiwayat(pesanan.metode_pembayaran)}
                </p>

            </div>
        `;

    } catch (error) {
        console.error("Gagal mencari pesanan:", error);
        pesan.textContent = "Terjadi kesalahan: " + error.message;

    } finally {
        tombol.disabled = false;
        tombol.textContent = "Cek Pesanan";
    }
});

// =====================================
// PENGAMAN TAMPILAN TEKS
// =====================================

function escapeHTMLRiwayat(teks) {
    return String(teks ?? "").replace(/[&<>"']/g, karakter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[karakter]);
}
