import React from 'react'
import { useLocation } from 'react-router-dom'
import { TabList, Link } from './styles'

type NonEmptyArray<T> = [T, ...T[]]

interface TabProps {
  path: string
  text: string
  basePath?: string
  currentPath?: string
}

export const Tab = ({
  path,
  text,
  basePath,
  ...props
}: TabProps): JSX.Element => {
  const destination: string = `${basePath ? basePath + '/' : ''}${path}`
  return (
    <li>
      <Link
        to={destination}
        isActive={props.currentPath?.includes(path)}
      >
        {text}
      </Link>
    </li>
  )
}

interface TabsetProps {
  height?: string
  width?: string
  basePath?: string
  children: NonEmptyArray<React.ReactNode>
}

export const Tabset = ({
  height,
  width,
  basePath,
  children
}: TabsetProps): JSX.Element => {
  let location = useLocation()

  return (
    <TabList height={height} width={width}>
      {children.map((element, index) =>
        React.cloneElement(element as any, {
          key: index,
          currentPath: location.pathname,
          basePath
        })
      )}
    </TabList>
  )
}
