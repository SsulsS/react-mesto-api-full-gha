import '../index.css'
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import {useEffect, useState} from "react";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import {api} from "../utils/Api";
import CurrentUserContext from "../contexts/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import {Route, Routes } from "react-router-dom";
import {register, login, auth} from "../utils/register";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Register";

function App() {
    const [isInfoToolTipOpen, setIsInfoTooltipOpen] = useState(false);
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState({});
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState({});
    const [cards, setCards] = useState([]);
    const [isOk, setIsOk] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [error, setError] = useState('');
    const [jwt, setJwt] = useState('');

    const fetchCards = async () => {
        if (jwt) {
            try {
                const res = await api.getInitialCards({
                    authorization: `Bearer ${jwt}`,
                });
                setCards(res);
            } catch (e) {
                console.warn(e) 
            }
        }
    }

    const handleRegister = async (password, email) => {
        try {
            await register(password, email)
            setIsOk(true);
            setIsInfoTooltipOpen(true);
        } catch (e) {
            console.warn(e);
            setIsOk(false);
            setIsInfoTooltipOpen(true);
            setError(e);
        }
    }

    const handleLogin = async (password, email) => {
        try {
            const { token } = await login(password, email);
            const data = await auth(token);
            setUserEmail(data.email);
            localStorage.setItem('token', token);
            setIsLoggedIn(true);
        } catch (e) {
            console.warn(e);
            setIsOk(false);
            setIsInfoTooltipOpen(true);
            setError(e);
        }
    }

    const logout = () => {
            localStorage.removeItem('token');
            setUserEmail('');
            setIsLoggedIn(false);
    }

    const checkToken = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setJwt(token);
            try {
                const data = await auth(token);
                setCurrentUser(data);
                setUserEmail(data.email);
                setIsLoggedIn(true);
            } catch (e) {
                console.warn(e);
                setIsLoggedIn(false);
            }
        }
    };

    useEffect(() => {
        checkToken();
        fetchCards();
    }, [isLoggedIn, jwt])

    const handleCardLike = async (card) => {
        const isLiked = card.likes.some(i => (i._id || i) === currentUser._id);
        try {
            const { updatedCard } = await api.changeLikeCardStatus(card, !isLiked);
            setCards((state) => state.map((c) => c._id === updatedCard._id ? updatedCard : c));
        } catch (error) {
            console.warn(error);
        }
    }

    const handleDeleting = async (card) => {
        try {
            await api.deleteCard(card._id);
            setCards((newArray) => newArray.filter((item) => card._id !== item._id))
            closeAllPopups();
        } catch (error) {
            console.warn(error);
        }
    }

    const handleUserUpdate = async (obj) => {
        try {
            const changedProfile = await api.setUserInfo(obj);
            setCurrentUser(changedProfile);
            closeAllPopups();
        } catch (e) {
            console.warn(e)
        }
    }

    const handleAvatarUpdate = async (obj) => {
        try {
            const avatarChanged = await api.changeAvatar(obj);
            setCurrentUser(avatarChanged);
            closeAllPopups();
        } catch (e) {
            console.warn(e)
        }
    }

    const handleAddPlace = async (obj) => {
        try {
            const { card } = await api.addNewCard(obj);
            setCards([card, ...cards]);
            closeAllPopups();
        } catch (e) {
            console.warn(e)
        }
    }

    const handleCardClick = (obj) => {
        setIsImageOpen(true);
        setSelectedCard(obj);
    }

    const closeAllPopups = () => {
        setIsEditProfilePopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setIsImageOpen(false);
        setIsInfoTooltipOpen(false);
    }

    const handleEditAvatarClick = () => {
        setIsEditAvatarPopupOpen(true);
    }

    const handleEditProfileClick = () => {
        setIsEditProfilePopupOpen(true);
    }

    const handleAddPlaceClick = () => {
        setIsAddPlacePopupOpen(true);
    }

    return (
        <CurrentUserContext.Provider value={currentUser}>
                <div className="page">
                    <Header email={userEmail} logout={logout} />
                    <Routes>
                        <Route path='/' element={<ProtectedRoute
                            isLoggedIn={isLoggedIn}
                            Component={Main}
                            onAddPlace={handleAddPlaceClick}
                            onEditProfile={handleEditProfileClick}
                            onEditAvatar={handleEditAvatarClick}
                            onCardClick={handleCardClick}
                            closePopup={closeAllPopups}
                            cards={cards}
                            onCardLike={handleCardLike}
                            onCardDelete={handleDeleting}
                        />} />
                        <Route path='/sign-up'
                                        element={<Register handleRegister={handleRegister}
                                                           isOpen={isInfoToolTipOpen}
                                                           isOk={isOk}
                                                           onClose={closeAllPopups}
                                                           error={error}
                                                           isLoggedIn={isLoggedIn}
                                        />}/>
                        <Route path='/sign-in'
                                        element={<Login handleLogin={handleLogin}
                                                        isLoggedIn={isLoggedIn}
                                                        isOpen={isInfoToolTipOpen}
                                                        isOk={isOk}
                                                        onClose={closeAllPopups}
                                                        error={error}
                                        />}/>
                    </Routes>
                    <Footer />
                    <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUserUpdate} />
                    <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlace}/>
                    <ImagePopup onClose={closeAllPopups} card={selectedCard} isImageOpen={isImageOpen}/>
                    <PopupWithForm
                        title={'Вы уверены?'}
                        name={'confirm'}
                        btnText={'Да'}
                    >
                    </PopupWithForm>
                    <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleAvatarUpdate} />
                </div>
        </CurrentUserContext.Provider>
    );
}

export default App;
