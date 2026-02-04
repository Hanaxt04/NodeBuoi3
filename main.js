let products = [];
let currentPage = 1;
let pageSize = 5;
let currentSort = { key: null, asc: true };

const API = "https://api.escuelajs.co/api/v1/products";

async function loadData() {
    const res = await fetch(API);
    products = await res.json();
    render();
}

function render() {
    let filtered = products.filter(p =>
        p.title.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    if (currentSort.key) {
        filtered.sort((a, b) => {
            return currentSort.asc
                ? a[currentSort.key] > b[currentSort.key] ? 1 : -1
                : a[currentSort.key] < b[currentSort.key] ? 1 : -1;
        });
    }

    const start = (currentPage - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);

    tableBody.innerHTML = "";
    pageData.forEach(p => {
        tableBody.innerHTML += `
            <tr title="${p.description}" onclick="openDetail(${p.id})">
                <td>${p.id}</td>
                <td>${p.title}</td>
                <td>${p.price}</td>
                <td>${p.category.name}</td>
                <td><img src="${p.images[0]}" width="50"></td>
            </tr>
        `;
    });

    pageInfo.innerText = `Page ${currentPage}`;
}

searchInput.oninput = () => {
    currentPage = 1;
    render();
};

pageSize.onchange = () => {
    pageSize = +pageSize.value;
    currentPage = 1;
    render();
};

function nextPage() {
    currentPage++;
    render();
}

function prevPage() {
    if (currentPage > 1) currentPage--;
    render();
}

function sortBy(key) {
    currentSort.asc = currentSort.key === key ? !currentSort.asc : true;
    currentSort.key = key;
    render();
}

function exportCSV() {
    let csv = "id,title,price\n";
    products.forEach(p => {
        csv += `${p.id},${p.title},${p.price}\n`;
    });

    const blob = new Blob([csv]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.csv";
    a.click();
}

async function openDetail(id) {
    const p = products.find(x => x.id === id);
    detailId.value = p.id;
    detailTitle.value = p.title;
    detailPrice.value = p.price;
    detailDesc.value = p.description;
    new bootstrap.Modal(detailModal).show();
}

async function updateProduct() {
    await fetch(`${API}/${detailId.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: detailTitle.value,
            price: detailPrice.value,
            description: detailDesc.value
        })
    });
    alert("Updated!");
}

async function createProduct() {
    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: createTitle.value,
            price: createPrice.value,
            description: createDesc.value,
            categoryId: 1,
            images: [createImage.value]
        })
    });
    alert("Created!");
}

loadData();
