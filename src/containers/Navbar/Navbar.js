import React, { Component } from 'react';
// import    from './../../components/Avatar/Avatar';
import {connect} from 'react-redux';
import * as actions from '../../store/actions'
import { Link } from 'react-router-dom';



function setCookie(name, value, options) {
    options = options || {};

    let expires = options.expires;

    if (typeof expires == "number" && expires) {
        let d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }
    value = encodeURIComponent(value);
    let updatedCookie = name + "=" + value;
    for (let propName in options) {
        updatedCookie += "; " + propName;
        let propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }
    document.cookie = updatedCookie;
}

function deleteCookie(name) {
    setCookie(name, "", {
        expires: -1
    })
}


class Navbar extends Component {
    state = {
        value: ''
    };

    logOut(event){
        deleteCookie('token');
        deleteCookie('userID');
    }

    render() {
        const avatarLabelURL = "https://mycs.net.au/wp-content/uploads/2016/03/person-icon-flat.png";
        const menuLabelURL = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Hamburger_icon.svg/1200px-Hamburger_icon.svg.png";
        return (
            <nav id="navbar" className="navbar">
                <img alt="" className="avatar" src={avatarLabelURL} />
                <p></p>
                <p>{this.props.usr.currentUser.userName}</p>
                    <div className="dropdown-menu">
                        <img alt="" className="menu-label" src={menuLabelURL} />
                        <div className="menu-list">
                            <Link to='/chats'>Chats</Link>
                            <Link to='/users'>Users</Link>
                            <Link to='/' onClick={(event) => this.logOut(event)}>Log Out</Link>
                        </div>
                    </div>
            </nav>
        );
    };
}

const mapDispatchToProps = (dispatch) => {
    return    {
        usersList: (userId, name) => dispatch(actions.currentUser()),
        currentUser: (userId, userName, isAuthorized) => dispatch(actions.currentUser(userId, userName, isAuthorized))
    }
};

const mapStateToProps = state => {
    return {
        usr: state.usr
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(Navbar);