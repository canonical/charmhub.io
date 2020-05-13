def is_authenticated(session):
    """
    Checks if the user is authenticated from the session
    Returns True if the user is authenticated
    """
    return "openid" in session


def empty_session(session):
    """
    Empty the session, used to logout.
    """
    session.pop("openid", None)
