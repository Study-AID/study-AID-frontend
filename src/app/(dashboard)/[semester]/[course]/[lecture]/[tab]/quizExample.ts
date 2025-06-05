export const quizExample = {
  metadata: {
    model: 'gpt-4o',
    created_at: '2025-05-26T21:00:42.145460',
    prompt_tokens: 10042,
    completion_tokens: 1388,
    total_tokens: 11430,
    language: 'ko_2',
  },
  quiz_questions: [
    {
      question_type: 'true_or_false',
      question:
        'Linear regression can be used for both regression and classification tasks.',
      answer: false,
      explanation:
        'Linear regression is specifically used for regression tasks where the output is continuous. For classification tasks, logistic regression is more appropriate as it predicts probabilities for discrete classes.',
    },
    {
      question_type: 'true_or_false',
      question:
        'Gradient descent always finds the global minimum for any type of loss function.',
      answer: false,
      explanation:
        'Gradient descent is guaranteed to find the global minimum only for convex loss functions, like the Mean Squared Error in linear regression. For non-convex functions, it may converge to local minima or saddle points.',
    },
    {
      question_type: 'true_or_false',
      question:
        'Regularization techniques like L1 and L2 are used to prevent overfitting by modifying the loss function.',
      answer: true,
      explanation:
        'Regularization adds a penalty term to the loss function to discourage complex models with large coefficients, thereby reducing overfitting.',
    },
    {
      question_type: 'multiple_choice',
      question:
        'Which of the following statements about logistic regression is true?',
      options: [
        {
          text: 'It provides a closed-form solution like linear regression.',
          is_correct: false,
        },
        {
          text: 'It predicts the probability of a binary outcome using a logistic function.',
          is_correct: true,
        },
        {
          text: 'It cannot be regularized.',
          is_correct: false,
        },
        {
          text: 'It is used for predicting continuous outcomes.',
          is_correct: false,
        },
      ],
      explanation:
        'Logistic regression uses the logistic (sigmoid) function to predict probabilities for binary classification. It does not have a closed-form solution and can be regularized using techniques like L1 or L2 regularization.',
    },
    {
      question_type: 'multiple_choice',
      question:
        "In the context of linear regression, what does the term 'Ordinary Least Squares' (OLS) refer to?",
      options: [
        {
          text: 'A method for solving logistic regression.',
          is_correct: false,
        },
        {
          text: 'A technique for finding the best-fit line by minimizing the sum of squared residuals.',
          is_correct: true,
        },
        {
          text: 'A type of regularization that penalizes large coefficients.',
          is_correct: false,
        },
        {
          text: 'A gradient-based optimization algorithm.',
          is_correct: false,
        },
      ],
      explanation:
        'OLS is a method used in linear regression to find the best-fit line by minimizing the sum of squared differences between observed and predicted values, known as residuals.',
    },
    {
      question_type: 'multiple_choice',
      question:
        'Which of the following is a key advantage of using gradient descent for training models?',
      options: [
        {
          text: 'It provides an exact solution for all types of models.',
          is_correct: false,
        },
        {
          text: 'It is computationally efficient for large datasets.',
          is_correct: true,
        },
        {
          text: 'It does not require hyperparameter tuning.',
          is_correct: false,
        },
        {
          text: 'It always converges to the global minimum.',
          is_correct: false,
        },
      ],
      explanation:
        'Gradient descent is particularly useful for large datasets as it is computationally efficient and can handle data that does not fit into memory, unlike exact methods which may require matrix inversion.',
    },
    {
      question_type: 'short_answer',
      question:
        'What is the primary goal of regularization in machine learning models?',
      answer: 'Prevent overfitting',
      explanation:
        'Regularization aims to prevent overfitting by adding a penalty term to the loss function, which discourages overly complex models.',
    },
    {
      question_type: 'short_answer',
      question:
        'In linear regression, which parameter estimation method minimizes the Residual Sum of Squares (RSS)?',
      answer: 'Ordinary Least Squares',
      explanation:
        'Ordinary Least Squares (OLS) is the method used to estimate the parameters in linear regression by minimizing the Residual Sum of Squares.',
    },
    {
      question_type: 'short_answer',
      question:
        'In gradient descent, what hyperparameter determines the size of the steps taken towards the minimum of the loss function?',
      answer: 'Learning rate',
      explanation:
        'The learning rate is a hyperparameter that controls the size of the steps taken during each iteration of gradient descent.',
    },
    {
      question_type: 'essay',
      question:
        'Compare and contrast the use of L1 and L2 regularization in linear regression. Discuss their effects on model complexity and feature selection.',
      answer:
        'L1 regularization encourages sparsity by driving some coefficients to zero, which can be useful for feature selection. L2 regularization, on the other hand, shrinks coefficients but retains all features, hence controlling model complexity without feature selection.',
      explanation:
        'This question encourages learners to understand the practical impact of L1 and L2 regularization on model complexity and feature selection. It fosters critical thinking about when and why to use each type of regularization depending on the problem context.',
    },
    {
      question_type: 'essay',
      question:
        'Explain how gradient descent is used to optimize the parameters of a logistic regression model. What challenges might arise during this process?',
      answer:
        'Gradient descent iteratively updates model parameters by moving them in the direction that reduces the loss function, using the gradient of the loss. Challenges include choosing an appropriate learning rate, avoiding local minima, and ensuring convergence.',
      explanation:
        'This question helps learners explore the mechanics of gradient descent in logistic regression, emphasizing the importance of hyperparameter tuning and understanding optimization challenges.',
    },
    {
      question_type: 'essay',
      question:
        'Discuss the role of feature selection and regularization in enhancing the interpretability and performance of regression models. Provide examples of techniques used for each.',
      answer:
        'Feature selection reduces model complexity by selecting relevant features, improving interpretability and performance. Techniques include forward selection and recursive feature elimination. Regularization, such as L1 and L2 penalties, prevents overfitting by penalizing large coefficients.',
      explanation:
        'This question is designed to integrate knowledge about feature selection and regularization, encouraging learners to think about their complementary roles in model building and the trade-offs involved.',
    },
  ],
};
