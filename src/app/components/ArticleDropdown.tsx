import {
  FiEdit,
  FiChevronDown,
  FiTrash,
  FiShare,
  FiPlusSquare,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction, useState } from "react";
import { IconType } from "react-icons";
import {
  Link as SmoothLink,
  Button,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from "react-scroll";
import { title } from "process";

const StaggeredDropDown = ({
  title1,
  title2,
}: {
  title1: string;
  title2: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-3 flex items-center justify-center bg-white">
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <button
          onClick={() => setOpen((pv) => !pv)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-white font-bold bg-[#1a1a1a] transition-colors"
        >
          <span className="font-medium text-sm">Pick an Article!</span>
          <motion.span variants={iconVariants}>
            <FiChevronDown />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "-50%" }}
          className="flex flex-col gap-2 p-2 rounded-lg bg-[#1a1a1a] shadow-xl absolute top-[120%] left-[50%] w-48 overflow-hidden"
        >
          <SmoothLink
            to={title1}
            activeClass="active"
            spy={true}
            delay={100}
            smooth={true}
            offset={50}
            duration={700}
          >
            <Option
              setOpen={setOpen}
              Icon={FiEdit}
              text={title1.substring(0, 20) + "..."}
            />
          </SmoothLink>
          <SmoothLink
            to={title2}
            activeClass="active"
            spy={true}
            delay={100}
            smooth={true}
            offset={50}
            duration={700}
          >
            <Option
              setOpen={setOpen}
              Icon={FiPlusSquare}
              text={title2.substring(0, 20) + "..."}
            />
          </SmoothLink>

          <Option setOpen={setOpen} Icon={FiShare} text="Share" />
          <Option setOpen={setOpen} Icon={FiTrash} text="Remove" />
        </motion.ul>
      </motion.div>
    </div>
  );
};

const Option = ({ text, Icon, setOpen }) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md text-white hover:bg-indigo-100  hover:text-[#af1222] transition-colors cursor-pointer"
    >
      <motion.span variants={actionIconVariants}>
        <Icon />
      </motion.span>
      <span>{text}</span>
    </motion.li>
  );
};

export default StaggeredDropDown;

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.1,
    },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
    },
  },
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      when: "afterChildren",
    },
  },
};

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -7 },
};
