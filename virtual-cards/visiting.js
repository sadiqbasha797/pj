document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cardForm');
    const cardPreview = document.getElementById('cardPreview');
    const downloadBtn = document.getElementById('downloadBtn');
    const profileImageInput = document.getElementById('profileImage');
    let profileImageURL = null;

    // Handle image upload
    profileImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            profileImageURL = URL.createObjectURL(file);
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const title = document.getElementById('title').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        // Update preview
        document.getElementById('previewName').textContent = name;
        document.getElementById('previewTitle').textContent = title;
        document.getElementById('previewEmail').textContent = email;
        document.getElementById('previewPhone').textContent = phone;

        // Update profile image
        if (profileImageURL) {
            const profileImg = document.getElementById('profileImg');
            profileImg.src = profileImageURL;
            profileImg.classList.remove('hidden');
        }

        // Generate QR Code (using dummy link)
        const qrcodeElement = document.getElementById('qrcode');
        qrcodeElement.innerHTML = ''; // Clear previous QR code
        new QRCode(qrcodeElement, {
            text: 'https://contact.projexino.com/',
            width: 96,
            height: 96
        });

        // Show preview
        cardPreview.classList.remove('hidden');
    });

    downloadBtn.addEventListener('click', function() {
        // Create a canvas from the card
        html2canvas(document.getElementById('card')).then(canvas => {
            // Convert canvas to image and download
            const link = document.createElement('a');
            link.download = 'visiting-card.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Clean up the object URL
            if (profileImageURL) {
                URL.revokeObjectURL(profileImageURL);
            }
        });
    });
});
