def is_authenticated(session):
    """
    Checks if the user is authenticated from the session
    Returns True if the user is authenticated
    """
    return "account-auth" in session


def empty_session(session):
    """
    Empty the session, used to logout.
    """
    session.pop("account", None)
    session.pop("account-auth", None)
    session.pop("account-macaroon", None)
