import { Breadcrumb } from 'react-bootstrap'

import { Link } from 'react-router-dom'

export default ({ items, activeItem }): JSX.Element => {
  var pathRef: string = ''
  const Items: JSX.Element[] = items.map(item => {
    const isActive: boolean = activeItem === item
    pathRef = `${pathRef}/${item}`
    //console.log(pathRef, isActive)
    return (
      <Breadcrumb.Item
        key={item}
        linkAs={props => <span>{props.children}</span>}
        active={isActive}
      >
        <Link to={pathRef.toLowerCase()}>{item}</Link>
      </Breadcrumb.Item>
    )
  })
  return <Breadcrumb>{Items}</Breadcrumb>
}
