const imageInput3 = document.getElementById('imageInput3');
const encryptedImageInput = document.getElementById('encryptedImageInput');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const encryptedImagesContainer = document.getElementById('encryptedImagesContainer');
const downloadLinksContainer = document.getElementById('downloadLinksContainer');
const ctx3 = document.createElement('canvas').getContext('2d');

let originalImagesData = [];
let encryptedImagesData = [];
let imageFiles = [];
let encryptedImageFiles = [];

// Logistic map 混沌映射函数
function logisticMap(x, r) {
    return r * x * (1 - x);
}

// 根据输入密钥生成混沌序列
function generateChaosSequence(key, length, r) {
    let chaosSequence = [];
    let x = key / 2147483647;  // 将密钥缩放到 (0, 1) 范围内
    for (let i = 0; i < length; i++) {
        x = logisticMap(x, r);
        chaosSequence.push(Math.floor(x * 256));  // 映射到 0-255 的整数
    }
    return chaosSequence;
}

// 加密图片
encryptBtn.addEventListener('click', () => {
    if (!imageInput3.files.length) {
        alert("Please select images first!");
        return;
    }

    const key = parseInt(prompt("Enter an encryption key (integer):"));
    if (isNaN(key)) {
        alert("Please enter a valid encryption key!");
        return;
    }

    const r = 3.99;  // Logistic 混沌映射参数，选择接近混沌区间上限的值

    imageFiles = Array.from(imageInput3.files);
    encryptedImagesData = [];
    encryptedImagesContainer.innerHTML = ''; // 清空容器

    let imagesProcessed = 0;
    imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;

                ctx3.canvas.width = width;
                ctx3.canvas.height = height;
                ctx3.drawImage(img, 0, 0, width, height);

                const originalImageData = ctx3.getImageData(0, 0, width, height);
                const encryptedImageData = ctx3.createImageData(width, height);

                // 生成混沌序列
                const chaosSequenceR = generateChaosSequence(key, width * height, r);
                const chaosSequenceG = generateChaosSequence(key + 1, width * height, r);
                const chaosSequenceB = generateChaosSequence(key + 2, width * height, r);

                // 遍历图片像素并加密 (混沌加密)
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const index = (y * width + x) * 4;
                        const r = originalImageData.data[index];
                        const g = originalImageData.data[index + 1];
                        const b = originalImageData.data[index + 2];

                        // 使用混沌序列对RGB值进行加密
                        const encR = r ^ chaosSequenceR[y * width + x];
                        const encG = g ^ chaosSequenceG[y * width + x];
                        const encB = b ^ chaosSequenceB[y * width + x];

                        encryptedImageData.data[index] = encR;
                        encryptedImageData.data[index + 1] = encG;
                        encryptedImageData.data[index + 2] = encB;
                        encryptedImageData.data[index + 3] = 255;  // Alpha 通道设为不透明
                    }
                }

                // 将加密后的数据写回 canvas
                ctx3.putImageData(encryptedImageData, 0, 0);

                // 将Canvas图片转换为JPG并显示
                const dataURL = ctx3.canvas.toDataURL('image/jpg');
                encryptedImagesData.push({dataURL, fileName: file.name});
                imagesProcessed++;

                if (imagesProcessed === imageFiles.length) {
                    // 所有图片处理完成，显示结果
                    displayEncryptedImages();
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
});

// 解密图片
decryptBtn.addEventListener('click', () => {
    if (!encryptedImageInput.files.length) {
        alert("Please upload encrypted images first!");
        return;
    }

    const key = parseInt(prompt("Enter the decryption key (integer):"));
    if (isNaN(key)) {
        alert("Please enter a valid decryption key!");
        return;
    }

    const r = 3.99;  // Logistic 混沌映射参数

    encryptedImageFiles = Array.from(encryptedImageInput.files);
    encryptedImagesData = [];
    encryptedImagesContainer.innerHTML = ''; // 清空容器

    let imagesProcessed = 0;
    encryptedImageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;

                ctx.canvas.width = width;
                ctx.canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const encryptedImageData = ctx.getImageData(0, 0, width, height);
                const decryptedImageData = ctx.createImageData(width, height);

                // 生成混沌序列
                const chaosSequenceR = generateChaosSequence(key, width * height, r);
                const chaosSequenceG = generateChaosSequence(key + 1, width * height, r);
                const chaosSequenceB = generateChaosSequence(key + 2, width * height, r);

                // 遍历图片像素并解密 (混沌解密)
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const index = (y * width + x) * 4;
                        const encR = encryptedImageData.data[index];
                        const encG = encryptedImageData.data[index + 1];
                        const encB = encryptedImageData.data[index + 2];

                        // 使用混沌序列对RGB值进行解密
                        const decR = encR ^ chaosSequenceR[y * width + x];
                        const decG = encG ^ chaosSequenceG[y * width + x];
                        const decB = encB ^ chaosSequenceB[y * width + x];

                        decryptedImageData.data[index] = decR;
                        decryptedImageData.data[index + 1] = decG;
                        decryptedImageData.data[index + 2] = decB;
                        decryptedImageData.data[index + 3] = 255;  // Alpha 通道设为不透明
                    }
                }

                // 将解密后的数据写回 canvas
                ctx.putImageData(decryptedImageData, 0, 0);

                // 将Canvas图片转换为JPG并显示
                const decryptedDataURL = ctx.canvas.toDataURL('image/jpg');
                const decryptedImage = document.createElement('img');
                decryptedImage.src = decryptedDataURL;
                decryptedImage.style.display = 'block';
                decryptedImage.alt = `Decrypted Image ${imagesProcessed + 1}`;
                encryptedImagesContainer.appendChild(decryptedImage);
                imagesProcessed++;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
});

// 显示加密后的图片
function displayEncryptedImages() {
    encryptedImagesContainer.innerHTML = ''; // 清空容器
    encryptedImagesData.forEach(({dataURL, fileName}, index) => {
        const img = document.createElement('img');
        img.src = dataURL;
        img.style.display = 'block';
        img.alt = `Encrypted Image ${index + 1} (${fileName})`;
        encryptedImagesContainer.appendChild(img);
    });

    // 提供下载链接
    const downloadLinks = document.createElement('div');
    encryptedImagesData.forEach(({dataURL, fileName}, index) => {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `encrypted_${fileName}`;
        link.textContent = `Download Encrypted ${fileName}`;
        link.style.display = 'block';
        downloadLinks.appendChild(link);
    });
    downloadLinksContainer.innerHTML = '';
    downloadLinksContainer.appendChild(downloadLinks);
    downloadLinksContainer.style.display = 'block';
}
