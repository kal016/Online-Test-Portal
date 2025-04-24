import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    college_name: '',
    college_id: '',
    profile_pic: null,
    id_card: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/register', data);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert('Registration failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <h2>Register</h2>
      <input type="text" name="full_name" placeholder="Full Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
      <input type="text" name="college_name" placeholder="College Name" onChange={handleChange} required />
      <input type="text" name="college_id" placeholder="College ID" onChange={handleChange} required />
      <label>Upload Profile Picture:</label>
      <input type="file" name="profile_pic" accept="image/*" onChange={handleChange} required />
      <label>Upload College ID:</label>
      <input type="file" name="id_card" accept="image/*" onChange={handleChange} required />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
