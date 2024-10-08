'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';
import Input from '#components/_forms/Input';
import Button from '#components/_forms/Button';
import Dropdown from '#components/_forms/Dropdown';
import Search from '#components/_forms/Search';
import DiscountApi from '#api/admin/discount';
import Panel from "#components/layout/panel/Panel.jsx";

const DiscountCreate = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        type: 'percentage',
        is_combinable: false,
        start_date: '',
        end_date: '',
        products: [],
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSelectedProducts = (selectedProducts) => {
        setFormData((prevData) => ({
            ...prevData,
            products: selectedProducts.map((product) => product.id)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await DiscountApi.create(formData);

            // Redirect to the discount index page after successful creation
            router.push('/admin/discounts');
        } catch (error) {
            setError(error.message || 'Failed to create discount');
        }
    };

    return (
        <Panel title={'Create Discount'} buttonLink={'/admin/discounts'} buttonLabel={'Go to back'} darkMode={true}>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Form onSubmit={handleSubmit}>
                <FormGroup title="Discount Information">
                    <Input
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <Input
                        label="Amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                    />
                    <Dropdown
                        label="Type"
                        value={formData.type}
                        onChange={handleChange}
                        options={[
                            { value: 'fixed', label: 'Fixed' },
                            { value: 'percentage', label: 'Percentage' }
                        ]}
                    />
                    <Dropdown
                        label="Combinable with others?"
                        value={formData.is_combinable}
                        onChange={(e) => setFormData({ ...formData, is_combinable: e.target.value === 'true' })}
                        options={[
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' }
                        ]}
                    />
                    <Input
                        label="Start Date"
                        name="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={handleChange}
                    />
                    <Input
                        label="End Date"
                        name="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={handleChange}
                    />
                </FormGroup>

                <FormGroup title="Associate Products (Optional)">
                    <Search
                        searchUrl="products"
                        label="Search Products"
                        multiple={true}
                        updateSelectedItems={handleSelectedProducts}
                    />
                </FormGroup>

                <Button type="submit" label="Create Discount" color="purple" />
            </Form>
        </Panel>
    );
};

export default DiscountCreate;
