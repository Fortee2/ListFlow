import axios from 'axios';
import {Listing} from './listing'

if (!process.env.REACT_APP_API_URL) {
  throw new Error('REACT_APP_API_URL is not defined');
}

const API_URL = `${process.env.REACT_APP_API_URL}/listing`;

export const getAllListings = async (): Promise<Listing[]> => {
  try {
    const response = await axios.get(API_URL);
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    throw new Error(`Error fetching listings: ${error}`);
  }
};

export const createListing = async (newListing: Listing): Promise<Listing> => {
  try {
    const response = await axios.post(API_URL, newListing);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating listing: ${error}`);
  }
};

export const updateListing = async (updatedListing: Listing): Promise<Listing> => {
  try {
    const response = await axios.put(`${API_URL}/${updatedListing.id}`, updatedListing);
    return response.data;
  } catch (error) {
    throw new Error(`Error updating listing: ${error}`);
  }
};

export const deleteListing = async (id: string): Promise<number> => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.status;
  } catch (error) {
    throw new Error(`Error deleting listing: ${error}`);
  }
};

export const getListingById = async (id: string): Promise<Listing> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching listings: ${error}`);
  }
};
