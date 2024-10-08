import Api from "./api";

export class VideoApi extends Api {

    static async getAll(filters = {}) {
        let url = new URL(`${this.baseUrl}/api/videos`);
        let params = new URLSearchParams();
        for (let key in filters) {
            params.append(key, filters[key]);
        }
        if(params.toString()) {
            url.search = params.toString();
        }
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error status:', response.status, 'Error body:', errorBody);
            throw new Error('Error while fetching streams');
        }
        return await response.json();
    }

    static async getOne(id) {
        const response = await fetch(`${this.baseUrl}/api/videos/${id}`, {
            method: 'GET',
            headers: this.getHeaders('multipart/form-data'),
        });
        if(!response.ok) {
            throw new Error('Error while fetching stream');
        }
        return await response.json();
    }

    static async create(data) {
        const response = await fetch(`${this.baseUrl}/api/videos`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if(!response.ok) {
            throw new Error('Error while creating stream');
        }
        return await response.json();
    }

    static async getUploadPolicy(file) {
            const response = await fetch(`${this.baseUrl}/api/videos/generate-upload-policy`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get upload policy');
            }

        return await response.json();
    }

    static async update(id, data) {
        const response = await fetch(`${this.baseUrl}/api/videos/${id}`, {
            method: 'PUT',
            headers: this.getHeaders({}),
            body: data,
        });
        if(!response.ok) {
            throw new Error('Error while updating stream');
        }
        return await response.json();
    }

    static async delete(id) {
        const response = await fetch(`${this.baseUrl}/api/videos/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while deleting stream');
        }
    }

    static async uploadToS3(s3Url, file) {
        try {
            const response = await fetch(s3Url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                    'Access-Control-Allow-Origin': '*',
                },
            });

            const data = await response.json();
            return data.url; // URL to upload the video to S3
        } catch (error) {
            console.error('Error fetching presigned URL:', error);
            throw error;
        }
    }
}