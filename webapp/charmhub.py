class Config():
    def __init__(self, d):
        self.__dict__ = d

config = Config({
    "app_name": "charmhub.io",
    "details_regex": "[a-z0-9-]*[a-z][a-z0-9-]*",
    "details_regex_uppercase": "[A-Za-z0-9-]*[A-Za-z][A-Za-z0-9-]*"
})
