Feature: Bdd Framework Tests

  Scenario: verify Data Context works across scenarios - 1
    Given a variable set to 2
    When I increment the variable by 2
    Then the variable should contain 4

  Scenario: verify Data Context works across scenarios - 2
    Given a variable set to 1
    When I increment the variable by 1
    Then the variable should contain 2

  Scenario: compare json
    Given the user matches the pattern
        """
                {
                    "state": "PA"
                }
        """
  Scenario: constructor args
    Given a class with args "string1" and "string2"
