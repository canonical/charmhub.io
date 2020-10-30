"""
Example module.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua.
"""


def test_function():
    """
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur.

        Parameters:
            a (int): A decimal integer
            b (int): Another decimal integer

        Returns:
            result (str): A string containing "foo"
    """
    return "foo"


class Person:
    """
    A class to represent a person.

    Attributes
    ----------
    name : str
        first name of the person
    surname : str
        family name of the person
    age : int
        age of the person

    Methods
    -------
    info(additional=""):
        Prints the person's name and age.
    """

    def __init__(self, name, surname, age):
        """
        Constructs all the necessary attributes for the person object.

        Parameters
        ----------
            name : str
                first name of the person
            surname : str
                family name of the person
            age : int
                age of the person
        """

        self.name = name
        self.surname = surname
        self.age = age

    def info(self, additional):
        """
        Prints the person's name and age.

        If the argument 'additional' is passed, then it is appended after
        the main info.

        Parameters
        ----------
        additional : str, optional
            More info to be displayed (default is None)

        Returns
        -------
        None
        """

        print(
            f"My name is {self.name} {self.surname}. I am {self.age}"
            "years old. {additional}"
        )


class AnotherClass:
    def add_binary(a, b):
        """
        Returns the sum of two decimal numbers in binary digits.

            Parameters:
                a (int): A decimal integer
                b (int): Another decimal integer

            Returns:
                binary_sum (str): Binary string of the sum of a and b
        """

        binary_sum = bin(a + b)[2:]
        return binary_sum

    def another_fuction(a):
        """
        Returns a simple string.

            Parameters:
                a (int): A decimal integer

            Returns:
                result (str): A string containing "foo"
        """

        def get_result(a):
            """
            Function inside a method that return a string.

                Parameters:
                    a (int): A decimal integer

                Returns:
                    result (str): A string containing "foo"
            """
            return "foo"

        result = get_result(a)
        return result
