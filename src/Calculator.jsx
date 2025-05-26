/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import { evaluate, pi } from "mathjs";

const Calculator = () => {
  // State variables for input, memory storage, angle unit (degrees/radians), and shift mode
  const [input, setInput] = useState("");
  const [memory, setMemory] = useState(null);
  const [angleUnit, setAngleUnit] = useState("deg");
  const [shift, setShift] = useState(false);
  const inputRef = useRef(null); // Reference to input field for cursor control

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); // mobile keyboard wont show

  // Handles button clicks, inserting values or functions into the input field
  const handleClick = (value, isFunc = false) => {
    const cursorPos = inputRef.current.selectionStart; //This gets the current cursor position in the input field.
                                                       // This is useful for inserting text at the cursor’s position instead of just appending it at the end.
    let newValue = isFunc && isNaN(value) ? `${value}()` : value; //Purpose: This determines whether to insert a function call (e.g., sin(), log()) or just a normal value (like numbers or operators).
    //isFunc is true when the clicked button represents a function (like sin, cos, etc.).
     // isNaN(value): Ensures that the value is not a number (functions are text, not numbers).
// If both conditions are true, it formats the value as a function call by adding () (e.g., "sin()", "log()").
// Otherwise, it just inserts the raw value.
    // Prevent multiple decimals in the same number
    let newCursorPos =  isFunc && isNaN(value) ? cursorPos + value.length + 1 : cursorPos + 1;  // This determines where to place the cursor after inserting the new value.
    // cursorPos + value.length + 1: Moves the cursor right after the function name and inside ().
// Otherwise, it just moves the cursor one step forward.

  // If the input is currently showing an error, clear it when user starts typing new values
  if (input === "Error") {
    setInput("");
  }

    if (value === ".") {
      const lastNumber = input.split(/[+\-*/^()]/).pop(); // Get the last number
      if (lastNumber.includes(".")) return; // Prevent adding another "."
    }
    
    if (value === "^2" || value === "^3") {
      newValue = value; 
      newCursorPos = cursorPos + newValue.length; // Ensure cursor moves right after the exponent
    } else if (value === "^") {
      newValue = "^()"; 
      newCursorPos = cursorPos + 2; // Moves cursor inside the parentheses for exponent entry
    }


    setInput(
      (prev) => prev.slice(0, cursorPos) + newValue + prev.slice(cursorPos)
    );
    // prev: The previous value of input (before updating).
// No, prev is not a built-in function. It's just a parameter name used inside the state update function.
// prev.slice(0, cursorPos): Extracts the part before the cursor position.

// newValue: The new value being inserted (e.g., "5", "+", "sin()").

// prev.slice(cursorPos): Extracts the part after the cursor position.

// Concatenation (+): Combines these three parts into a new string.




 // keep cursor at the end after adding a character/number

     setTimeout(() => {
      inputRef.current.selectionStart = inputRef.current.selectionEnd =  newCursorPos; 
      inputRef.current.focus();
      // inputRef.current.selectionStart = newCursorPos → Moves the cursor to the correct position.
// inputRef.current.selectionEnd = newCursorPos → Ensures the selection is collapsed (so it's just a cursor, not a selection).
    }, 10);
  };

  const handleClear = () => setInput("");
  const handleDelete = () => setInput(input.slice(0, -1));  //slice(start, end) extracts a portion of an array without modifying the original.
  const handleMemorySave = () => setMemory(input);
  const handleMemoryRecall = () => memory !== null && setInput(memory);
  const toggleAngleUnit = () =>
    setAngleUnit((prev) => (prev === "deg" ? "rad" : "deg"));
  const toggleShift = () => setShift((prev) => !prev);

  const handleCalculate = () => {

      // Clear error if there's one before calculation
  if (input === "Error") {
    setInput("");
  }

    try {
      let expression = input
        .replace(/cot\(/g, "1/tan(")
        .replace(/sec\(/g, "1/cos(")
        .replace(/csc\(/g, "1/sin(")
        .replace(/log\(/g, "log10(")
        .replace(/ln\(/g, "log(")
        .replace(/(\d+)!/g, "factorial($1)") // Convert n! to factorial(n)
        .replace(/π/g, "pi")
        .replace(/cot\(/g, "1/tan(")
        .replace(/sec\(/g, "1/cos(")
        .replace(/csc\(/g, "1/sin(")



      if (angleUnit === "deg") {
        expression = expression.replace(
          /(sin|cos|tan)\(([^)]+)\)/g,
          (match, func, angle) => {
            return `${func}(${angle} * pi / 180)`;
          }
        );
      }


      const result = evaluate(expression).toString();
      setInput(result);

      // keep cursor at the end after evaluating a result

      // React state updates (setInput(...)) do not happen immediately—they are asynchronous.

// If we try to set selectionStart and selectionEnd immediately after setInput, React might not have updated the input value yet.

// Wrapping it in setTimeout(..., 10) ensures that React has finished updating the input before we move the cursor.
//If you remove setTimeout, the cursor might jump to the wrong position or stay at the end because React’s update is not instant.
      setTimeout(() => {
        inputRef.current.selectionStart = inputRef.current.selectionEnd =  result.length;
        inputRef.current.focus();
      }, 10);
    } catch (error) {
      setInput("Error");
    }
  };

  return (
    <section className="w-full  max-w-fit m-0.5 mx-auto p-5 rounded-2xl bg-gray-800 flex flex-col text-center shadow-2xl">
      <input
        ref={inputRef}
        value={input}
        readOnly={isMobile}
  onClick={() => inputRef.current.focus()}
        // onKeyDown={(e) => e.preventDefault()} 
        //  readOnly    
        onChange={(e) => setInput(e.target.value)}
        className="w-full h-16 bg-gray-900 text-white text-xl text-right p-3 rounded mb-3 overflow-auto caret-white"
      />
      

      <div className="grid grid-cols-6 gap-2">
        <button
        type="button"
          onClick={handleMemorySave}
          className="bg-gray-600 p-2 rounded text-white"
        >
          MS
        </button>
        <button
          onClick={handleMemoryRecall}
          className="bg-gray-600 p-2 rounded text-white"
        >
          MR
        </button>
        <button
          onClick={toggleAngleUnit}
          className={`p-2 rounded text-white ${
            angleUnit === "deg" ? "bg-green-600" : "bg-orange-500"
          }`}
        >
          {angleUnit === "deg" ? "DEG" : "RAD"}
        </button>
        <button
          onClick={toggleShift}
          className={`bg-gray-600 p-2 rounded text-white ${
            shift ? "bg-orange-500" : ""
          }`}
        >
        Shift
        </button>
        <button
          onClick={() => handleClick("(")}
          className="bg-gray-600 p-2 rounded text-white"
        >
          (
        </button>
        <button
          onClick={() => handleClick(")")}
          className="bg-gray-600 p-2 rounded text-white"
        >
          )
        </button>

        {/* Great question! The reason true is passed as the second argument (isFunc = true) in handleClick(op, true) for trigonometric and hyperbolic functions, but not for other operators like numbers or factorial (!), is because of how these functions are structured in mathematical expressions. */}
        {/* Without true, clicking "sin" would just insert "sin" instead of "sin()", making it harder for the user. */}
        {[
          shift ? "asin" : "sin",
          shift ? "acos" : "cos",
          shift ? "atan" : "tan",
          shift ? "acsc" : "csc",
          shift ? "asec" : "sec",
          shift ? "acot" : "cot",
        ].map((op) => (
          <button
            key={op}
            onClick={() => handleClick(op, true)}
            className={`bg-gray-600 p-2  rounded text-white ${
              shift ? "bg-orange-500" : "bg-orange-600 "
            }`}
          >
    {/* Display pretty label for inverse functions */}
    {shift
      ? op.replace(/^a/, "") + "⁻¹"
      : op}
          </button>
        ))}

{["^2","^3"].map((op) => (
          <button
            key={op}
            onClick={() => handleClick(op)}
            className="bg-gray-600 p-2 rounded text-white"
          >
            {op}
          </button>
        ))}

        {["log", "ln", "sqrt"].map((op) => (
          <button
            key={op}
            onClick={() => handleClick(op, true)}
            className="bg-gray-600 p-2 rounded text-white"
          >
            {op}
          </button>
        ))}

        <button
          onClick={() => handleClick("!")}
          className="bg-gray-600 p-2 rounded text-white"
        >
          n!
        </button>

        {[
          shift ? "asinh" : "sinh",
          shift ? "acosh" : "cosh",
          shift ? "atanh" : "tanh",
          shift ? "acsch" : "csch",
          shift ? "asech" : "sech",
          shift ? "acoth" : "coth",
        ].map((op) => (
          <button
            key={op}
            onClick={() => handleClick(op, true)}
            className={`bg-gray-600 p-2 rounded  text-white ${
              shift ? "bg-orange-500  text-sm" : "bg-orange-600"
            }`}
          >
               {/* Display pretty label for inverse functions */}
    {shift  ? op.replace(/^a/, "") + "⁻¹"    : op}
          </button>
        ))}
        </div>

<div className="grid grid-cols-5 gap-2 mt-2">
        {[7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleClick(num.toString())}
            className="bg-gray-700 p-3 rounded text-white"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleDelete}
          className="bg-orange-500 p-2 rounded text-white"
        >
          DEL
        </button>
        <button
          onClick={handleClear}
          className="bg-red-500 p-3 rounded text-white"
        >
          C
        </button>

        {[4, 5, 6, "."].map((num, index) => (
          <button
            key={index}
            onClick={() => handleClick(num.toString())}
            className={`p-3 rounded text-white ${
              typeof num === "number" ? "bg-gray-700" : "bg-gray-600"
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={handleCalculate}
          className="bg-green-600 p-3 rounded text-white"
        >
          =
        </button>
        {[1, 2, 3, "*", "/"].map((num, index) => (
          <button
            key={index}
            onClick={() => handleClick(num.toString())}
            className={`p-3 rounded text-white ${
              typeof num === "number" ? "bg-gray-700" : "bg-gray-600"
            }`}
          >
            {num}
          </button>
        ))}


<button
  onClick={() => handleClick("π")}
  className="bg-gray-600 p-3 rounded text-white"
>
  π
</button>

        <button
          onClick={() => handleClick("^")}
          className="bg-gray-600 p-3 rounded text-white"
        >
          x<sup>y</sup>
        </button>


 {/* Change <button> to <button type="button"> to prevent unintended form submissions. */}
 {/* <button> elements default to type="submit", which can cause unintended form submissions if wrapped in a <form>. */}
 <button
        type="button"
          onClick={() => handleClick("0")}
          className="bg-gray-700 p-3 rounded text-white"
        >
          0
        </button>

        {["+", "-"].map((num, index) => (
          <button
            key={index}
            onClick={() => handleClick(num.toString())}
            className="p-3 rounded text-white bg-gray-600"
          >
            {num}
          </button>
        ))}


      </div>
    </section>
  );
};

export default Calculator;