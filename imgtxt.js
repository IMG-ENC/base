const imageInput = document.getElementById('imageInput');
const compressBtn = document.getElementById('compressBtn');
const decompressBtn = document.getElementById('decompressBtn');
const imageCanvas = document.getElementById('imageCanvas');
const downloadLink = document.getElementById('downloadLink');
const txtInput = document.getElementById('txtInput');
const outputImage = document.getElementById('outputImage');
const ctx = imageCanvas.getContext('2d');

// Run-Length Encoding function
function runLengthEncode(pixelData, width, height) {
    let encodedData = `${width} ${height}\n`;  // First line: width and height
    let prevPixel = null;
    let count = 0;

    for (let i = 0; i < pixelData.length; i += 4) {
        const r = pixelData[i];
        const g = pixelData[i + 1];
        const b = pixelData[i + 2];
        const currentPixel = `${r},${g},${b}`;

        if (currentPixel === prevPixel) {
            count++;
        } else {
            if (prevPixel !== null) {
                encodedData += `${prevPixel},${count}\n`;
            }
            prevPixel = currentPixel;
            count = 1;
        }
    }
    if (prevPixel !== null) {
        encodedData += `${prevPixel},${count}\n`;
    }

    return encodedData;
}

// Compress image to TXT
compressBtn.addEventListener('click', () => {
    if (!imageInput.files.length) {
        alert("Please select an image first!");
        return;
    }

    const file = imageInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;

            imageCanvas.width = width;
            imageCanvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            const encodedData = runLengthEncode(imageData.data, width, height);

            const blob = new Blob([encodedData], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download = 'compressed_image_rle.txt';
            downloadLink.style.display = 'block';
            downloadLink.textContent = 'Download Compressed TXT';
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

// Decompress TXT to image
decompressBtn.addEventListener('click', () => {
    txtInput.style.display = 'block';
    txtInput.addEventListener('change', () => {
        const file = txtInput.files[0];
        if (!file) {
            alert("Please select a .txt file!");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const txtContent = event.target.result.split('\n');
            
            const [width, height] = txtContent[0].split(' ').map(Number);

            imageCanvas.width = width;
            imageCanvas.height = height;

            const imageData = ctx.createImageData(width, height);

            let pixelIndex = 0;
            txtContent.slice(1).forEach(line => {
                const parts = line.split(',');
                const r = Number(parts[0]);
                const g = Number(parts[1]);
                const b = Number(parts[2]);
                const count = Number(parts[3]);

                for (let i = 0; i < count; i++) {
                    imageData.data[pixelIndex] = r;
                    imageData.data[pixelIndex + 1] = g;
                    imageData.data[pixelIndex + 2] = b;
                    imageData.data[pixelIndex + 3] = 255;  // Alpha channel
                    pixelIndex += 4;
                }
            });

            ctx.putImageData(imageData, 0, 0);

            const dataURL = imageCanvas.toDataURL();
            outputImage.src = dataURL;
            outputImage.style.display = 'block';
        };

        reader.readAsText(file);
    });
});
