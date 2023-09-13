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
import { GiTeamIdea } from "react-icons/gi";
import { FaFaceSadCry } from "react-icons/fa6";
import { GiDonut } from "react-icons/gi";
import { FaUserDoctor } from "react-icons/fa6";
import { FaRankingStar } from "react-icons/fa6";

const StaggeredDropDown = ({
  title1,
  title2,
  title3,
  title4,
}: {
  title1: string;
  title2: string;
  title3?: string;
  title4?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-3 flex items-center justify-center">
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <button
          onClick={() => setOpen((pv) => !pv)}
          className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-[#1a1a1a] font-bold bg-[#e0dfdf] dark:bg-[#0a0a0a] dark:text-white transition-colors"
        >
          <span className="text-[12px]">Pick an Article!</span>
          <motion.span variants={iconVariants}>
            <FiChevronDown />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "-50%" }}
          className="flex flex-col gap-2 p-2 rounded-[5px] text-[#1a1a1a]  bg-[#e0dfdf] dark:bg-[#0a0a0a] dark:text-white shadow-xl absolute top-[120%] left-[50%] w-48 overflow-hidden"
        >
          <SmoothLink
            className={!title1 ? `hidden` : `block`}
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
              Icon={FaRankingStar}
              text={title1.substring(0, 20) + "..."}
            />
          </SmoothLink>
          <SmoothLink
            className={!title2 ? `hidden` : `block`}
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
              Icon={FaFaceSadCry}
              text={title2.substring(0, 20) + "..."}
            />
          </SmoothLink>
          <SmoothLink
            className={!title3 ? `hidden` : `block`}
            to={title3}
            activeClass="active"
            spy={true}
            delay={100}
            smooth={true}
            offset={50}
            duration={700}
          >
            <Option
              setOpen={setOpen}
              Icon={GiTeamIdea}
              text={title3?.substring(0, 20) + "..."}
            />
          </SmoothLink>
          <SmoothLink
            className={!title4 ? `hidden` : `block`}
            to={title4}
            activeClass="active"
            spy={true}
            delay={100}
            smooth={true}
            offset={50}
            duration={700}
          >
            <Option
              setOpen={setOpen}
              Icon={FaUserDoctor}
              text={title4?.substring(0, 20) + "..."}
            />
          </SmoothLink>
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
      className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md  hover:bg-indigo-100  hover:text-[#af1222] transition-colors cursor-pointer"
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
