import React, {useContext} from 'react';
import trash from "../images/Trash.svg";
import CurrentUserContext from "../contexts/CurrentUserContext";

const Card = ({ image, title, likesCount, onCardClick, card, onCardLike, onCardDelete }) => {
    const user = useContext(CurrentUserContext);

    const isLiked = card.likes.some((i) => (i._id || i) === user._id);

    const cardLikeButtonClassName = `card__item-like-button ${isLiked ? 'card__item-like-button_active' : ''}`

    return (
        <li className="card__item">
            <img src={trash} alt="Корзина"
                 className="card__item-thrash" onClick={() => {
                     onCardDelete(card)
            }} />
            <img src={image} alt={title}
                 className="card__item-image" onClick={() => onCardClick(card)} />
            <div className="card__item-description">
                <h2 className="card__item-title">{title}</h2>
                <div className="card__item-like-container">
                    <button type="button" className={cardLikeButtonClassName} onClick={() => {
                        onCardLike(card)
                    }}/>
                    <p className="card__item-like-counter">{likesCount}</p>
                </div>
            </div>
        </li>
    );
};

export default Card;