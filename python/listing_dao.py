import mysql.connector
from mysql.connector import errorcode
import pandas as pd

class listing_dao:

    def __init__(self, user, password, host, database):
        self.db_user = user
        self.db_password = password
        self.db_host = host
        self.db_name = database

        self.current_connection = None
    
    def open_connection(self):
        self.current_connection = mysql.connector.connect(user=self.db_user, 
                      password=self.db_password,
                      host=self.db_host,
                      database=self.db_name)

    def close_connection(self):
       self.current_connection.close()
       
    def image_associated(self, items_number):
        try:
            cursor = self.current_connection.cursor()
            
            query = 'SELECT CrossPostID FROM listflow.Listing WHERE ItemNumber = %s and CrossPostId is not null;'

            cursor.execute(query, (items_number,))
            df_ids = pd.DataFrame(cursor.fetchall())
        
            self.current_connection.commit()
            cursor.close()
            
            if df_ids.empty:
                return False
            
            return True
        except mysql.connector.Error as err:
            print(err)
            
    def update_cross_post_id(self, item_number, uuid):
        try:
            cursor = self.current_connection.cursor()
            
            query = 'UPDATE listflow.Listing SET CrossPostID = %s WHERE ItemNumber = %s'
            cursor.execute(query, (uuid, item_number))

            self.current_connection.commit()
            cursor.close()
        except mysql.connector.Error as err:
            print(err)