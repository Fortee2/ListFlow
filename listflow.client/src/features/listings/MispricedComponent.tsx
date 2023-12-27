import React from 'react';

interface Item {
    itemNumber: string;
    itemTitle: string;
    price: number;
    crossPostPrice: number;
    crossPostItemNumber: string;
}

interface Props {
    items: Item[];
}

const MispricedComponent: React.FC<Props> = ({ items }) => {
    return (
        <div className="grid-container">
            {items.map((item) => (
                <div key={item.itemNumber} className="grid-item">
                    <p>Item Number: {item.itemNumber}</p>
                    <p>Item Title: {item.itemTitle}</p>
                    <p>Price: {item.price}</p>
                    <p>Cross Post Price: {item.crossPostPrice}</p>
                    <p>Cross Post Item Number: {item.crossPostItemNumber}</p>
                </div>
            ))}
        </div>
    );
};

export default MispricedComponent;
