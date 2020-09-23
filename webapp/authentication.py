def is_authenticated(session):
    """
    Checks if the user is authenticated from the session
    Returns True if the user is authenticated
    """
    return "publisher-auth" in session


def empty_session(session):
    """
    Empty the session, used to logout.
    """
    session.pop("publisher", None)
    session.pop("publisher-auth", None)
    session.pop("publisher-macaroon", None)
