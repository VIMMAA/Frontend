
document.getElementById('DownloadButton').addEventListener('click', function () {
    
    const response = 1 //Связать с запросом конкретной заявки

    if (responseFromBackend.attachedFiles && responseFromBackend.attachedFiles.length > 0) 
        {

        responseFromBackend.attachedFiles.forEach(file => 
        {
            const binaryData = atob(file.data); 
            const arrayBuffer = new ArrayBuffer(binaryData.length);
            const uint8Array = new Uint8Array(arrayBuffer);

            for (let i = 0; i < binaryData.length; i++) {
                uint8Array[i] = binaryData.charCodeAt(i);
            }

            const blob = new Blob([uint8Array], { type: 'application/octet-stream' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = file.name; 
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        });
    } else 
    {
        console.log("Нет файлов для скачивания.");
    }
});

async function DownloadFile(id) 
{
    try 
    {
        const Url = `https://okr.yzserver.ru/api/AttachedFile/${id}`;

        const response = await fetch(Url);
        if (!response.ok) {
            throw new Error(`Ошибка при загрузке файла: ${response.statusText}`);
        }

        const fileData = await response.json();

        const binaryData = atob(fileData.data); 
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([uint8Array], { type: 'application/octet-stream' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileData.name; 
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } 
    catch (error) 
    {
        console.error("Произошла ошибка при скачивании файла:", error);
    }
}

