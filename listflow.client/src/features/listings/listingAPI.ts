import axios from 'axios';
import {Listing} from './listing'
export const getAllListings = async (): Promise<Listing[]> => {
  try {
    const response = await axios.get('http://localhost:5227/api/listing');
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    throw new Error(`Error fetching listings: ${error}`);
  }
};

export const createListing = async (newListing: Listing): Promise<Listing> => {
  try {
    const response = await axios.post('http://localhost:5227/api/listing', newListing);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating listing: ${error}`);
  }
};

export const updateListing = async (updatedListing: Listing): Promise<Listing> => {
  try {
    const response = await axios.put(`http://localhost:5227/api/listing/${updatedListing.id}`, updatedListing);
    return response.data;
  } catch (error) {
    throw new Error(`Error updating listing: ${error}`);
  }
};

export const deleteListing = async (id: string): Promise<number> => {
  try {
    const response = await axios.delete(`http://localhost:5227/api/listing/${id}`);
    return response.status;
  } catch (error) {
    throw new Error(`Error deleting listing: ${error}`);
  }
};

export const getListingById = async (id: string): Promise<Listing> => {
    try {
      const response = await axios.get(`http://localhost:5227/api/listing/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching listings: ${error}`);
    }
  };