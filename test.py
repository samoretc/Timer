import unittest

from utils import *

class ProblemTests(unittest.TestCase):
	def test_isTime(self): 
		test_data = 'exercises[1][time]'
		assert is_time(test_data) == True
		assert is_name(test_data) == False

	def test_isName(self): 
		test_data = 'exercises[1][name]'
		assert is_time(test_data) == False
		assert is_name(test_data) == True

	def test_isRest(self): 
		test_data = 'exercises[1][rest]'
		assert is_rest(test_data) == True
		assert is_name(test_data) == False

	def test_findMax(self): 
		strings = ['exercises[1][time]', 'exercises[0][name]']
		self.assertEqual( findLength(strings), 2)

	def test_findPosition(self): 
		test_data = 'exercises[1][time]'
		self.assertEqual( findPosition(test_data), 1)

    # def test_findPosition(self):
    #     pass

    # def test_good_palindrome(self):
    #     pass

    # def test_bad_palindrome(self): 
    #     assert isPalindrome(123) == False
if __name__ == '__main__':
    unittest.main()