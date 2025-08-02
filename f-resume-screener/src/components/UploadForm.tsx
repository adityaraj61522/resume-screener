import { useState } from 'react';
import { Box, Button, FormControl, TextInput, Flash } from '@primer/react';
import styled from 'styled-components';

const FormContainer = styled(Box)`
  position: relative;
  z-index: 1;
  background: rgba(13, 17, 23, 0.8);
  padding: 2rem;
  border-radius: 6px;
  width: 100%;
  max-width: 400px;
  margin: 2rem auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
`;

interface FormData {
    name: string;
    email: string;
    file: File | null;
}

const UploadForm = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        file: null,
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            if (!formData.name.trim()) {
                throw new Error('Please enter your name');
            }

            if (!formData.email.trim()) {
                throw new Error('Please enter your email');
            }

            if (!formData.file) {
                throw new Error('Please upload a zip file');
            }

            if (!formData.file.name.endsWith('.zip')) {
                throw new Error('Please upload a zip file');
            }

            const formDataToSend = new FormData();
            formDataToSend.append('documents', formData.file);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);

            const response = await fetch('http://localhost:5001/api/data', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            setSuccess('Resume uploaded successfully!');
            setFormData({ name: '', email: '', file: null });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormContainer as="form" onSubmit={handleSubmit}>
            {error && (
                <Flash variant="danger" sx={{ mb: 3 }}>
                    {error}
                </Flash>
            )}
            {success && (
                <Flash variant="success" sx={{ mb: 3 }}>
                    {success}
                </Flash>
            )}

            <FormControl sx={{ mb: 3 }}>
                <FormControl.Label>Name</FormControl.Label>
                <TextInput
                    block
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                />
            </FormControl>

            <FormControl sx={{ mb: 3 }}>
                <FormControl.Label>Email</FormControl.Label>
                <TextInput
                    block
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                />
            </FormControl>

            <FormControl sx={{ mb: 3 }}>
                <FormControl.Label>Upload Resume (ZIP)</FormControl.Label>
                <TextInput
                    block
                    required
                    type="file"
                    accept=".zip"
                    onChange={(e) =>
                        setFormData({ ...formData, file: e.target.files?.[0] || null })
                    }
                />
            </FormControl>

            <Button
                type="submit"
                variant="primary"
                block
                disabled={isLoading}
            >
                {isLoading ? 'Uploading...' : 'Upload Resume'}
            </Button>
        </FormContainer>
    );
};

export default UploadForm;
