import axios from 'axios';
import {Listing} from './listing'
export const getAllListings = async (): Promise<Listing[]> => {
  try {
    const response = await axios.get('/api/listings');
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching listings: ${error}`);
  }
};

export const createListing = async (newListing: Listing): Promise<Listing> => {
  try {
    const response = await axios.post('/api/listings', newListing);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating listing: ${error}`);
  }
};

export const updateListing = async (updatedListing: Listing): Promise<Listing> => {
  try {
    const response = await axios.put(`/api/listings/${updatedListing.id}`, updatedListing);
    return response.data;
  } catch (error) {
    throw new Error(`Error updating listing: ${error}`);
  }
};

export const deleteListing = async (id: string): Promise<number> => {
  try {
    const response = await axios.delete(`/api/listings/${id}`);
    return response.status;
  } catch (error) {
    throw new Error(`Error deleting listing: ${error}`);
  }
};

export const getListingById = async (id: string): Promise<Listing> => {
    try {
      const response = await axios.get(`/api/listings/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching listings: ${error}`);
    }
  };