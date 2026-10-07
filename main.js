const contactName = document.getElementById("contactName");
const contactPhone = document.getElementById("contactPhone");
const contactEmail = document.getElementById("contactEmail");
const contactAddress = document.getElementById("contactAddress");
const contactGroup = document.getElementById("contactGroup");
const contactNotes = document.getElementById("contactNotes");
const contactFav = document.getElementById("contactFav");
const contactEmergency = document.getElementById("contactEmergency");

const searchInput = document.getElementById("searchInput");
const contactsList = document.getElementById("contactsList");
const contactsSubtitle = document.getElementById("contactsSubtitle");
const favList = document.getElementById("favList");
const emergencyList = document.getElementById("emergencyList");
const totalCount = document.getElementById("totalCount");
const favCount = document.getElementById("favCount");
const emergencyCount = document.getElementById("emergencyCount");

const contactForm = document.getElementById("contactForm");
const modalTitle = document.getElementById("modalTitle");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
const saveContactBtn = document.getElementById("saveContactBtn");

const contactModalEl = document.getElementById("contactModal");
const contactModal = new bootstrap.Modal(contactModalEl);

var colors = [
    "linear-gradient(135deg,#2b7fff,#155dfc)",
    "linear-gradient(135deg,#ffa500,#f97316)",
    "linear-gradient(135deg,#7b25fd,#5b3bfd)",
    "linear-gradient(135deg,#00bc7d,#009966)",
    "linear-gradient(135deg,#ff2056,#e7000b)"
];

var editId = null;
var contactPhoto = "";

function loadContacts() {
    if (localStorage.getItem("contacts")) {
        return JSON.parse(localStorage.getItem('contacts'));
    } else {
        return [];
    }
}

var contacts = loadContacts();

function saveContacts() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

function getIndexById(id) {
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) {
            return i;
        }
    }
    return -1;
}

function getInitials(name) {
    var words = name.trim().split(/\s+/);
    var initials = words[0][0];
    if (words.length > 1) {
        initials += words[words.length - 1][0];
    }
    return initials.toUpperCase();
}

function getAvatar(contact) {
    if (contact.contactPhoto) {
        return `<img src="${contact.contactPhoto}" alt="${contact.fullName}">`;
    }
    return getInitials(contact.fullName);
}

function getColor(contact) {
    return colors[contact.id % colors.length];
}

function getGroupClass(group) {
    if (group == "Family") return "tag-family";
    if (group == "Friends") return "tag-friends";
    if (group == "Work") return "tag-work";
    return "tag-other";
}

function setError(input, message) {
    input.classList.add("is-invalid");
    input.nextElementSibling.textContent = message;
}

function clearErrors() {
    contactName.classList.remove("is-invalid");
    contactPhone.classList.remove("is-invalid");
    contactEmail.classList.remove("is-invalid");
}

function validateForm() {
    clearErrors();
    var isValid = true;

    var nameRegex = /^[\p{L}\s.'-]{2,50}$/u;
    var phoneRegex = /^01[0125][0-9]{8}$/;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var name = contactName.value.trim();
    var phone = contactPhone.value.trim();
    var email = contactEmail.value.trim();

    if (name == "") {
        setError(contactName, "Name is required");
        isValid = false;
    } else if (!nameRegex.test(name)) {
        setError(contactName, "Name must be 2-50 letters only");
        isValid = false;
    }

    if (phone == "") {
        setError(contactPhone, "Phone number is required");
        isValid = false;
    } else if (!phoneRegex.test(phone)) {
        setError(contactPhone, "Enter a valid Egyptian phone number (e.g., 01012345678)");
        isValid = false;
    } else {
        for (var i = 0; i < contacts.length; i++) {
            if (contacts[i].phoneNumber == phone && contacts[i].id !== editId) {
                setError(contactPhone, "This phone number already exists");
                isValid = false;
                break;
            }
        }
    }

    if (email != "" && !emailRegex.test(email)) {
        setError(contactEmail, "Enter a valid email address");
        isValid = false;
    }

    return isValid;
}

function addContacts() {
    var newContacts = {
        id: Date.now(),
        fullName: contactName.value.trim(),
        phoneNumber: contactPhone.value.trim(),
        emailAddress: contactEmail.value.trim(),
        contactAddress: contactAddress.value.trim(),
        contactGroup: contactGroup.value,
        contactNotes: contactNotes.value.trim(),
        contactPhoto: contactPhoto,
        contactFav: contactFav.checked,
        contactEmergency: contactEmergency.checked
    };

    contacts.push(newContacts);
    saveContacts();
    refreshUI();
    contactModal.hide();

    Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Contact has been added successfully",
        timer: 1500,
        showConfirmButton: false
    });
}

function editContact(id) {
    var index = getIndexById(id);
    var contact = contacts[index];

    editId = id;
    contactName.value = contact.fullName;
    contactPhone.value = contact.phoneNumber;
    contactEmail.value = contact.emailAddress;
    contactAddress.value = contact.contactAddress;
    contactGroup.value = contact.contactGroup;
    contactNotes.value = contact.contactNotes;
    contactFav.checked = contact.contactFav;
    contactEmergency.checked = contact.contactEmergency;
    contactPhoto = contact.contactPhoto;
    showPhotoPreview();

    modalTitle.textContent = "Edit Contact";
    saveContactBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Contact';
    contactModal.show();
}

function updateContacts() {
    var index = getIndexById(editId);

    contacts[index].fullName = contactName.value.trim();
    contacts[index].phoneNumber = contactPhone.value.trim();
    contacts[index].emailAddress = contactEmail.value.trim();
    contacts[index].contactAddress = contactAddress.value.trim();
    contacts[index].contactGroup = contactGroup.value;
    contacts[index].contactNotes = contactNotes.value.trim();
    contacts[index].contactPhoto = contactPhoto;
    contacts[index].contactFav = contactFav.checked;
    contacts[index].contactEmergency = contactEmergency.checked;

    saveContacts();
    refreshUI();
    contactModal.hide();

    Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Contact has been updated successfully",
        timer: 1500,
        showConfirmButton: false
    });
}

function displayContacts(list) {
    var contentToRender = "";

    for (var i = 0; i < list.length; i++) {
        var c = list[i];

        var favBadge = c.contactFav ? `<span class="badge-fav"><i class="fa-solid fa-star"></i></span>` : "";
        var emgBadge = c.contactEmergency ? `<span class="badge-emg"><i class="fa-solid fa-heart-pulse"></i></span>` : "";

        var emailRow = c.emailAddress ? `<div class="info-row">
            <span class="info-icon mail-icon"><i class="fa-solid fa-envelope"></i></span>
            ${c.emailAddress}
        </div>` : "";

        var addressRow = c.contactAddress ? `<div class="info-row">
            <span class="info-icon address-icon"><i class="fa-solid fa-location-dot"></i></span>
            ${c.contactAddress}
        </div>` : "";

        var groupTag = c.contactGroup ? `<span class="tag ${getGroupClass(c.contactGroup)}">${c.contactGroup}</span>` : "";
        var emgTag = c.contactEmergency ? `<span class="tag tag-emergency"><i class="fa-solid fa-heart-pulse"></i> Emergency</span>` : "";

        var mailBtn = c.emailAddress ? `<a class="action-btn mail-btn" href="mailto:${c.emailAddress}" title="Email"><i
                    class="fa-solid fa-envelope"></i></a>` : "";

        contentToRender += `<div class="contact-card">
    <div class="contact-card-top d-flex align-items-center gap-3">
        <div class="avatar-box" style="background:${getColor(c)}">
            ${getAvatar(c)}
            ${favBadge}
            ${emgBadge}
        </div>
        <div>
            <h3 class="contact-name">${c.fullName}</h3>
            <div class="contact-phone d-flex align-items-center gap-2"><span
                    class="info-icon phone-icon"><i class="fa-solid fa-phone"></i></span>
                ${c.phoneNumber}
            </div>
        </div>
    </div>
    <div class="contact-info">
        ${emailRow}
        ${addressRow}
    </div>
    <div class="contact-tags d-flex gap-2">
        ${groupTag}
        ${emgTag}
    </div>
    <div class="card-footer-actions d-flex justify-content-between">
        <div class="card-left d-flex gap-2">
            <a class="action-btn call-btn" href="tel:${c.phoneNumber}" title="Call"><i
                    class="fa-solid fa-phone"></i></a>
            ${mailBtn}
        </div>
        <div class="card-right d-flex gap-2">
            <button class="action-btn fav-btn ${c.contactFav ? "active" : ""}" onclick="toggleFav(${c.id})" title="Favorite"><i
                    class="fa-solid fa-star"></i></button>
            <button class="action-btn emg-btn ${c.contactEmergency ? "active" : ""}" onclick="toggleEmergency(${c.id})" title="Emergency"><i
                    class="fa-solid fa-heart-pulse"></i></button>
            <button class="action-btn edit-btn" onclick="editContact(${c.id})" title="Edit"><i
                    class="fa-solid fa-pen"></i></button>
            <button class="action-btn delete-btn" onclick="deleteContacts(${c.id})" title="Delete"><i
                    class="fa-solid fa-trash"></i></button>
        </div>
    </div>
</div>`;
    }

    if (list.length == 0) {
        var message = contacts.length == 0 ? 'Click "Add Contact" to get started' : "Try searching with a different name, phone or email";
        contentToRender = `<div class="empty-state text-center">
            <div class="empty-icon"><i class="fa-solid fa-address-book"></i></div>
            <h5>No contacts found</h5>
            <p>${message}</p>
        </div>`;
    }

    contactsList.innerHTML = contentToRender;
}

function getSideItem(contact, itemClass, callClass) {
    return `<div class="side-item ${itemClass} d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
            <div class="side-avatar" style="background:${getColor(contact)}">
                ${getAvatar(contact)}
            </div>
            <div>
                <div class="side-name">${contact.fullName}</div>
                <div class="side-phone">${contact.phoneNumber}</div>
            </div>
        </div>
        <a class="side-call ${callClass}" href="tel:${contact.phoneNumber}" title="Call"><i
                class="fa-solid fa-phone"></i></a>
    </div>`;
}

function displaySidebar() {
    var favContent = "";
    var emergencyContent = "";

    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].contactFav) {
            favContent += getSideItem(contacts[i], "side-item-fav", "fav");
        }
        if (contacts[i].contactEmergency) {
            emergencyContent += getSideItem(contacts[i], "side-item-emg", "emergency");
        }
    }

    favList.innerHTML = favContent || '<p class="side-empty">No favorites yet</p>';
    emergencyList.innerHTML = emergencyContent || '<p class="side-empty">No emergency contacts</p>';
}

function updateStats() {
    var favs = 0;
    var emergencies = 0;

    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].contactFav) favs++;
        if (contacts[i].contactEmergency) emergencies++;
    }

    totalCount.textContent = contacts.length;
    favCount.textContent = favs;
    emergencyCount.textContent = emergencies;
    contactsSubtitle.textContent = `Manage and organize your ${contacts.length} contacts`;
}

function refreshUI() {
    searchContacts();
    displaySidebar();
    updateStats();
}

function deleteContacts(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "This contact will be deleted permanently",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e7000b",
        cancelButtonColor: "#6a7282",
        confirmButtonText: "Yes, delete it"
    }).then(function (result) {
        if (result.isConfirmed) {
            contacts.splice(getIndexById(id), 1);
            saveContacts();
            refreshUI();

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Contact has been deleted",
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

function toggleFav(id) {
    var index = getIndexById(id);
    contacts[index].contactFav = !contacts[index].contactFav;
    saveContacts();
    refreshUI();
}

function toggleEmergency(id) {
    var index = getIndexById(id);
    contacts[index].contactEmergency = !contacts[index].contactEmergency;
    saveContacts();
    refreshUI();
}

function searchContacts() {
    var term = searchInput.value.toLowerCase().trim();
    var searchedArr = [];
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].fullName.toLowerCase().includes(term) ||
            contacts[i].phoneNumber.includes(term) ||
            contacts[i].emailAddress.toLowerCase().includes(term)) {
            searchedArr.push(contacts[i]);
        }
    }
    displayContacts(searchedArr);
}

function showPhotoPreview() {
    if (contactPhoto) {
        photoPreview.innerHTML = `<img src="${contactPhoto}" alt="Contact photo">`;
    } else {
        photoPreview.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
}

function resetForm() {
    contactForm.reset();
    clearErrors();
    editId = null;
    contactPhoto = "";
    photoInput.value = "";
    showPhotoPreview();
    modalTitle.textContent = "Add New Contact";
    saveContactBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Contact';
}

photoInput.addEventListener("change", function () {
    var file = photoInput.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
        Swal.fire({
            icon: "warning",
            title: "Image is too large",
            text: "Please choose an image smaller than 500KB"
        });
        photoInput.value = "";
        return;
    }

    var reader = new FileReader();
    reader.onload = function () {
        contactPhoto = reader.result;
        showPhotoPreview();
    };
    reader.readAsDataURL(file);
});

contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (validateForm()) {
        if (editId === null) {
            addContacts();
        } else {
            updateContacts();
        }
    }
});

contactName.addEventListener("input", function () { contactName.classList.remove("is-invalid"); });
contactPhone.addEventListener("input", function () { contactPhone.classList.remove("is-invalid"); });
contactEmail.addEventListener("input", function () { contactEmail.classList.remove("is-invalid"); });

contactModalEl.addEventListener("hidden.bs.modal", resetForm);

refreshUI();