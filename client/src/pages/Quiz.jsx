
import React, { useState } from 'react';
import { quizQuestions } from '../data/quiz.js';
import SectionHeading from '../components/SectionHeading.jsx';

// Determines the result title based on the player's score.
const titleFor = (score) =>
    score >= 90 ? 'WORLD CHAMPION' :
    score >= 70 ? '2ND PLACE' :
    score >= 50 ? '3RD PLACE' :
    'TRY AGAIN';

export default function Quiz() {
    const [started, setStarted] = useState(false);
    const [answers, setAnswers] = useState({});
    const [done, setDone] = useState(false);
    const [review, setReview] = useState(false);

    // Calculate the score: 20 starting points + 8 for each correct answer.
    const score = 20 + Object.entries(answers).reduce(
        (sum, [idx, answer]) =>
            sum + (Number(answer) === quizQuestions[Number(idx)].answer ? 8 : 0),
        0
    );

    // Update the selected answer for a question.
    function selectAnswer(questionIndex, answerIndex) {
        setAnswers(previous => ({
            ...previous,
            [questionIndex]: answerIndex
        }));
    }

    // Finish the quiz only when all questions have been answered.
    function finishQuiz(event) {
        event.preventDefault();

        if (Object.keys(answers).length !== quizQuestions.length) {
            alert('Please answer all 10 questions before finishing the quiz.');
            return;
        }

        setDone(true);
        setReview(false);
    }

    // Reset everything to start a new quiz.
    function resetQuiz() {
        setStarted(false);
        setAnswers({});
        setDone(false);
        setReview(false);
    }

    return (
        <main className="page quiz-page">

            <SectionHeading
                kicker="F1 PAD / RACE YOUR KNOWLEDGE"
                title="F1 Trivia"
                description={`10 questions. Each correct answer earns 8 points, with a 20-point starting score. Maximum score: 100.`}
            />

            {/* QUIZ INTRODUCTION */}
            {!started ? (
                <div className="quiz-start">
                    <div className="quiz-number">
                        10<span>Q</span>
                    </div>

                    <div>
                        <h2>Ready for lights out?</h2>
                        <p>
                            Choose your answers and see what title you earn.
                            No pressure—just racing knowledge.
                        </p>

                        <button
                            className="btn red"
                            onClick={() => setStarted(true)}
                        >
                            Start quiz →
                        </button>
                    </div>
                </div>

            ) : !done || review ? (

                /* QUIZ QUESTIONS */
                <form className="question-list" onSubmit={finishQuiz}>

                    {review && (
                        <div className="welcome-strip">
                            <div>
                                <h3>Review your answers</h3>
                                <p className="muted">
                                    Green indicates the correct answer.
                                    Your selected answer is also marked.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="btn"
                                onClick={() => setReview(false)}
                            >
                                Back to results
                            </button>
                        </div>
                    )}

                    {quizQuestions.map((q, i) => (
                        <fieldset className="question-card" key={i}>

                            <legend>
                                <span className="question-num">
                                    QUESTION {String(i + 1).padStart(2, '0')}
                                </span>

                                <h3>{q.q}</h3>
                            </legend>

                            <div className="answer-list">

                                {q.options.map((opt, j) => {
                                    const isSelected = answers[i] === j;
                                    const isCorrect = q.answer === j;

                                    let answerClass = 'answer-option';

                                    if (isSelected) {
                                        answerClass += ' selected';
                                    }

                                    if (review && isCorrect) {
                                        answerClass += ' correct';
                                    }

                                    if (review && isSelected && !isCorrect) {
                                        answerClass += ' incorrect';
                                    }

                                    return (
                                        <label
                                            className={answerClass}
                                            key={j}
                                        >
                                            <input
                                                type="radio"
                                                name={`q${i}`}
                                                checked={isSelected}
                                                disabled={review}
                                                onChange={() =>
                                                    selectAnswer(i, j)
                                                }
                                            />

                                            <span>
                                                {String.fromCharCode(65 + j)}
                                            </span>

                                            {opt}
                                        </label>
                                    );
                                })}

                            </div>
                        </fieldset>
                    ))}

                    {!review && (
                        <button className="btn red" type="submit">
                            Finish quiz / Show result →
                        </button>
                    )}

                </form>

            ) : (

                /* QUIZ RESULTS */
                <div className="quiz-result">

                    <p className="kicker">CHECKERED FLAG</p>

                    <div className="result-score">
                        {score}
                        <small> / 100</small>
                    </div>

                    <h2>{titleFor(score)}</h2>

                    <p>
                        {score >= 90
                            ? 'You know your F1. Champion-level trivia!'
                            : score >= 70
                            ? 'Strong result. You are in the podium fight.'
                            : score >= 50
                            ? 'You earned a podium finish. Keep studying the grid.'
                            : 'Tough race. Review the paddock and try again.'}
                    </p>

                    <p className="muted">
                        Correct answers: {Object.entries(answers).filter(
                            ([idx, answer]) =>
                                Number(answer) === quizQuestions[Number(idx)].answer
                        ).length} / {quizQuestions.length}
                    </p>

                    <div className="result-actions">

                        <button
                            className="btn red"
                            onClick={resetQuiz}
                        >
                            Race again
                        </button>

                        <button
                            className="btn"
                            onClick={() => setReview(true)}
                        >
                            Review answers
                        </button>

                    </div>
                </div>
            )}

        </main>
    );
}
