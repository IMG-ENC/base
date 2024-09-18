    document.addEventListener('DOMContentLoaded', () => {
    const imageInput2 = document.getElementById('imageInput2');
    const processBtn = document.getElementById('processBtn');
    const imageCanvas2 = document.getElementById('imageCanvas2');
    const outputImage = document.getElementById('outputImage');
    const imageWidthInput = document.getElementById('imageWidth');
    const imageHeightInput = document.getElementById('imageHeight');
    const blockSizeInput = document.getElementById('blockSize');
    const ctx2 = imageCanvas2.getContext('2d');

    // 模糊处理和显示图片
    processBtn.addEventListener('click', () => {
        if (!imageInput2.files.length) {
            alert("Please select an image first!");
            return;
        }

        const blockSize = parseInt(blockSizeInput.value);
        if (isNaN(blockSize) || blockSize <= 0) {
            alert("Please enter a valid block size!");
            return;
        }

        const file = imageInput2.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;

                imageWidthInput.value = width;
                imageHeightInput.value = height;

                imageCanvas2.width = width;
                imageCanvas2.height = height;
                ctx2.drawImage(img, 0, 0, width, height);  // 绘制图片

                // 获取整张图片的像素数据
                const imageData = ctx2.getImageData(0, 0, width, height);

                // 遍历图片的像素，以指定块大小遍历
                for (let y = 0; y < height; y += blockSize) {
                    for (let x = 0; x < width; x += blockSize) {
                        let rSum = 0, gSum = 0, bSum = 0;
                        let pixelCount = 0;

                        // 遍历块区域内的像素并求平均值
                        for (let by = 0; by < blockSize; by++) {
                            for (let bx = 0; bx < blockSize; bx++) {
                                const px = x + bx;
                                const py = y + by;

                                if (px < width && py < height) {
                                    const index = (py * width + px) * 4;
                                    rSum += imageData.data[index];
                                    gSum += imageData.data[index + 1];
                                    bSum += imageData.data[index + 2];
                                    pixelCount++;
                                }
                            }
                        }

                        // 求块区域内RGB的平均值
                        const rAvg = Math.floor(rSum / pixelCount);
                        const gAvg = Math.floor(gSum / pixelCount);
                        const bAvg = Math.floor(bSum / pixelCount);

                        // 设置该区域的所有像素为平均值，实现模糊效果
                        for (let by = 0; by < blockSize; by++) {
                            for (let bx = 0; bx < blockSize; bx++) {
                                const px = x + bx;
                                const py = y + by;

                                if (px < width && py < height) {
                                    const index = (py * width + px) * 4;
                                    imageData.data[index] = rAvg;
                                    imageData.data[index + 1] = gAvg;
                                    imageData.data[index + 2] = bAvg;
                                    imageData.data[index + 3] = 255; // Alpha通道设为不透明
                                }
                            }
                        }
                    }
                }

                // 在Canvas上应用模糊后的像素数据
                ctx2.putImageData(imageData, 0, 0);

                // 将Canvas图片转换为URL并显示
                const dataURL = imageCanvas2.toDataURL();
                outputImage.src = dataURL;
                outputImage.style.display = 'block';
            };

            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
    });
});
