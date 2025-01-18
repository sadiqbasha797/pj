def getLargestNumber(num):
    # Convert string to list for easier manipulation
    digits = list(num)
    n = len(digits)
    
    # Keep swapping until no more improvements can be made
    changed = True
    while changed:
        changed = False
        for i in range(n-1):
            # Check if adjacent digits have same parity
            if (int(digits[i]) % 2 == int(digits[i+1]) % 2):
                # If current digit is smaller than next digit, swap them
                if digits[i] < digits[i+1]:
                    digits[i], digits[i+1] = digits[i+1], digits[i]
                    changed = True
    
    # Convert back to string and return
    return ''.join(digits)

# Test cases
def test_getLargestNumber():
    # Test case 1: Given example
    assert getLargestNumber("7596801") == "9758601", "Test case 1 failed"
    
    # Test case 2: All even numbers
    assert getLargestNumber("2468") == "8642", "Test case 2 failed"
    
    # Test case 3: All odd numbers
    assert getLargestNumber("13579") == "97531", "Test case 3 failed"
    
    # Test case 4: No possible swaps (different parity)
    assert getLargestNumber("12") == "12", "Test case 4 failed"
    
    # Test case 5: Single digit
    assert getLargestNumber("5") == "5", "Test case 5 failed"
    
    # Test case 6: Already in largest possible order
    assert getLargestNumber("9876") == "9876", "Test case 6 failed"
    
    # Test case 7: Mixed parity with multiple possible swaps
    assert getLargestNumber("1234567890") == "9876543210", "Test case 7 failed"
    
    print("All test cases passed!")

# Run the tests
if __name__ == "__main__":
    test_getLargestNumber()
