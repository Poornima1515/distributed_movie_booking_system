import React, {
  useState
} from "react";

import {
  useNavigate,
  Link
} from "react-router-dom";

import API from "../api";

import {
  motion
} from "framer-motion";

import {
 FaFilm,
FaLock,
FaEnvelope,
FaEye,
FaEyeSlash
} from "react-icons/fa";

function Login() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);
const [showPassword,
  setShowPassword] =
  useState(false);
  const handleLogin =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const res =
          await API.post(

            "/auth/login",

            {

              email,

              password

            }

          );

        localStorage.setItem(

          "user",

          JSON.stringify(
            res.data.user
          )

        );

        localStorage.setItem(

          "token",

          res.data.token
        );

        navigate("/home");

      } catch (error) {

        alert(

          error.response?.data?.message ||

          "Login failed"

        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <div
      style={{

        minHeight: "100vh",

        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        background:
          "linear-gradient(to right, #0f172a, #1e293b)",

        color: "white"

      }}
    >

      <motion.div

        initial={{
          opacity: 0,
          y: 50
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          duration: 0.6
        }}

        style={{

          background:
            "rgba(255,255,255,0.05)",

          padding: "40px",

          borderRadius: "20px",

          width: "400px",

          backdropFilter:
            "blur(10px)",

          boxShadow:
            "0 8px 30px rgba(0,0,0,0.4)"

        }}
      >

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px"
          }}
        >

          <FaFilm
            size={50}
            color="#ff004f"
          />

          <h1
            style={{
              marginTop: "10px"
            }}
          >

            Movie Booking

          </h1>

          <p
            style={{
              color: "#cbd5e1"
            }}
          >

            Distributed Ticket Platform

          </p>

        </div>

        <form
          onSubmit={handleLogin}
        >

          <div
            style={{
              marginBottom: "20px"
            }}
          >

            <label>Email</label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#1e293b",
                padding: "10px",
                borderRadius: "10px",
                marginTop: "5px"
              }}
            >

              <FaEnvelope />

              <input

                type="email"

                value={email}

                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }

                required

                placeholder="Enter email"

                style={{

                  marginLeft: "10px",

                  background:
                    "transparent",

                  border: "none",

                  outline: "none",

                  color: "white",

                  width: "100%"

                }}

              />

            </div>

          </div>

       <div
  style={{
    marginBottom: "20px"
  }}
>

  <label>Password</label>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      background: "#1e293b",
      padding: "10px",
      borderRadius: "10px",
      marginTop: "5px"
    }}
  >

    <FaLock />

    <input

      type={
        showPassword
        ? "text"
        : "password"
      }

      value={password}

      onChange={(e) =>
        setPassword(
          e.target.value
        )
      }

      required

      placeholder="Enter password"

      style={{

        marginLeft: "10px",

        background:
          "transparent",

        border: "none",

        outline: "none",

        color: "white",

        width: "100%"

      }}

    />

    <div
      onClick={() =>
        setShowPassword(
          !showPassword
        )
      }

      style={{
        cursor: "pointer"
      }}
    >

      {

        showPassword

        ? <FaEyeSlash />

        : <FaEye />

      }

    </div>

  </div>

</div>

          <motion.button

            whileHover={{
              scale: 1.05
            }}

            whileTap={{
              scale: 0.95
            }}

            type="submit"

            disabled={loading}

            style={{

              width: "100%",

              padding: "12px",

              background: "#ff004f",

              border: "none",

              borderRadius: "10px",

              color: "white",

              fontSize: "16px",

              cursor: "pointer",

              fontWeight: "bold"

            }}
          >

            {

              loading

              ? "Logging in..."

              : "Login"

            }

          </motion.button>

        </form>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#cbd5e1"
          }}
        >

          Don’t have an account?

          <Link

            to="/register"

            style={{
              color: "#ff004f",
              marginLeft: "5px",
              textDecoration: "none"
            }}
          >

            Register Here

          </Link>

        </p>

      </motion.div>

    </div>

  );

}

export default Login;