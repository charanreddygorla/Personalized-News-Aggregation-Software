import React from 'react';


const Card = ({ data }) => {
    console.log(data);

    const readMore = (url) => {
        window.open(url);
    };

    return (
        <div className="card-container">
            {data.map((curItem, index) => {
                if (!curItem.urlToImage) {
                    return null;
                } else {
                    return (
                        <div className="card" key={index}>
                            <img src={curItem.urlToImage} alt={curItem.title} />
                            <div className="card-content">
                                <a className="card-title" onClick={() => window.open(curItem.url)}>{curItem.title}</a>
                                <p className="card-description">{curItem.description}</p>
                                <button className="read-more-btn" onClick={() => window.open(curItem.url)}>Read More</button>
                            </div>
                        </div>
                    );
                }
            })}
        </div>
    );
};

export default Card;