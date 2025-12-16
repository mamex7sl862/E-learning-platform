import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function Quiz() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/quizzes/${quizId}`).then((res) => setQuestions(res.data));
  }, [quizId]);

  const handleAnswer = (qIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    const res = await api.post(`/quizzes/submit/${quizId}`, { answers });
    setResult(res.data);
  };

  return (
    <div>
      <h2>Quiz</h2>
      {questions.map((q, i) => (
        <div key={q._id}>
          <p>
            {i + 1}. {q.question}
          </p>
          {q.options.map((opt, j) => (
            <label key={j}>
              <input
                type="radio"
                name={`q${i}`}
                onChange={() => handleAnswer(i, j)}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={submitQuiz}>Submit Quiz</button>

      {result && (
        <div>
          <h3>Score: {result.score}</h3>
          <p>{result.passed ? "Passed" : "Failed"}</p>
        </div>
      )}
    </div>
  );
}
